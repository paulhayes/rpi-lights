using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System.Net.Sockets;
using System;
using System.IO;
using System.Text;

namespace mDNS {
    public class mDNSDiscovery {

        const int port = 5353;
        const string addr = "224.0.0.251";

        internal const int FlagsOffset = 2;
        internal const uint QueryFlag = 0x0001;
        internal const uint ResponseFlag = 0x84;
        internal const int FQDNOffset = 12;
        internal const int AddressTypeOffset = 0;
        internal const int IPClassOffset = 2;
        internal const int TTLOffset = 4;
        internal const int IPLengthOffset = 8;
        internal const int IPAddressOffset = 12; 

        public event System.Action<IPAddress,string> NameResolvedEvent;
        public event System.Action<IPAddress,string,int> PacketReceived;

        public HashSet<string> requestNames = new HashSet<string>();

        public enum QueryType : short {
            A = 0x1,
            PTR = 0x0c,
            SRV = 0x21,
            AAAA = 0x1c,
            NSEC = 0x2f,
            TXT = 0x10
        }

        public enum ClassType : short {
            IN = 0x01
        }

        UdpClient udpClient;

        public mDNSDiscovery(){
            IPAddress multicastAddress = IPAddress.Parse(addr);
            udpClient = new UdpClient(AddressFamily.InterNetwork);
            udpClient.JoinMulticastGroup(multicastAddress);

            //IPAddress multicastAddress = IPAddress.Parse(address);
            //var udpClient = new UdpClient(AddressFamily.InterNetwork);
            udpClient.ExclusiveAddressUse = false;
            udpClient.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            udpClient.Client.Bind(new IPEndPoint(IPAddress.Any, port));
            //udpClient.JoinMulticastGroup(multicastAddress);

            udpClient.BeginReceive(OnReceiveSink,null);
        }

        public class RequestInfo {
            public UdpClient client;
            public string name;
        }

        public void SendRequest(string name, QueryType type = QueryType.A)
        {
            
            //udpClient.ExclusiveAddressUse = false;

            IPAddress multicastAddress = IPAddress.Parse(addr);
            IPEndPoint remoteEP = new IPEndPoint(multicastAddress, port);

            mDNSRequest request = new mDNSRequest(name, type);
            Debug.Log("Sending request");

            byte[] requestBytes = request.ToByteArray();
            Debug.Log( ByteArrayToString(requestBytes) );

            var requestInfo = new RequestInfo(){
                name=name,
                client = udpClient
            };

            requestNames.Add(name);
            udpClient.BeginSend(requestBytes, requestBytes.Length, remoteEP, ReceiveAsync, requestInfo);
        }

        private void ReceiveAsync(IAsyncResult result)
        {
            RequestInfo requestInfo = result.AsyncState as RequestInfo;
            //requestInfo.client.EndSend(result);
            Debug.Log("Waiting for receive");
            string address = addr;
            //var host = Dns.GetHostEntry(Dns.GetHostName()); host.AddressList;

            /*List<IPAddress> localAddresses = new List<IPAddress>();
            foreach (NetworkInterface netInterface in NetworkInterface.GetAllNetworkInterfaces())
            {
                
            }

            */

        }

        private void OnReceiveSink(IAsyncResult result)
        {
            
            Debug.Log("OnReceiveSink");
            IPEndPoint ep = null;
            var session = udpClient;
            //var local = (IPEndPoint) args[1];

            byte[] buffer = session.EndReceive(result, ref ep);
            string dataStr = ByteArrayToString(buffer);
            //Do what you want here with the data of the buffer
            Debug.Log("derp");
            UnityMainThreadDispatcher.Instance().Enqueue( ()=>{
                if( PacketReceived != null ) 
                    PacketReceived.Invoke(ep.Address, dataStr, buffer.Length);
            } );
            Debug.Log("derp2");

            Debug.Log("Message received from " + ep + "  length="+buffer.Length);
            Debug.Log( dataStr );
            Debug.Log( ep.ToString() );


            if( mDNSResponse.IsResponse( buffer ) ){
                var response = new mDNSResponse();

                response.FromByteArray(buffer);
                Debug.Log(response.name +" "+response.address.ToString());
                Debug.LogFormat( ">>>> {1} : {0}",response.address, response.name );

                bool nameMatch = requestNames.Contains(response.name);
                string matchedName = response.name;
                if( !nameMatch && response.HasAnswerType(QueryType.PTR) ){
                    string requestName = response.GetAnswer(QueryType.PTR).requestName;
                    Debug.LogFormat("name didn't match, comparing requestName {0}",requestName);
                    nameMatch=requestNames.Contains(requestName);
                    if(nameMatch) matchedName = requestName;
                }
                if( NameResolvedEvent != null && nameMatch ) {
                    Debug.Log("Found!");
                    requestNames.Remove(matchedName);
                    UnityMainThreadDispatcher.Instance().Enqueue( ()=>{
                        NameResolvedEvent.Invoke(response.address,response.name);
                    });
                }
                else {

                }
            }

            //We make the next call to the begin receive
            //session.BeginReceive(OnReceiveSink, args);
            udpClient.BeginReceive(OnReceiveSink,null);

        }

        private void Close(){
            udpClient.Close();
        }

        public static string ByteArrayToString(byte[] ba)
        {
          StringBuilder hex = new StringBuilder(ba.Length * 2);
          foreach (byte b in ba)
            hex.AppendFormat("{0:x2} ", b);
          return hex.ToString();
        }
    }

    public class mDNSResponse {
        public string name;
        public IPAddress address;
        public int TTL;
        public int IPClass;
        public mDNSAnswer[] answers;

        public bool HasAnswerType(mDNSDiscovery.QueryType type){
            return Array.FindIndex( answers, (a)=>type==type ) != -1;
        }

        public mDNSAnswer GetAnswer(mDNSDiscovery.QueryType type){
            return Array.Find( answers, (a)=>type==type );
        }

        public void FromByteArray(byte[] data)
        {
            short numberOfAnswers = IPAddress.NetworkToHostOrder( BitConverter.ToInt16( data, 6 ) );
            answers = new mDNSAnswer[numberOfAnswers];
            int offset = mDNSDiscovery.FQDNOffset;
            byte nameLength = 0;
            short recordType = 0;
            int answerIndex = 0;
            while(answerIndex<numberOfAnswers ){
            /*
                nameLength = data[offset];
                recordType = IPAddress.NetworkToHostOrder( BitConverter.ToInt16( data, offset+nameLength+1 ) );
                if( recordType == (short)mDNS.mDNSDiscovery.QueryType.A ){
                    break;
                }
                answerIndex++;
                if( answer == numberOfAnswers ){
                    return;
                } 
                else {
                    
                    do {
                        offset+=nameLength+1;
                        nameLength = data[offset];
                    } 
                    while(nameLength != 0);
                    offset+=9;
                    offset += IPAddress.NetworkToHostOrder( BitConverter.ToInt16( data, offset ) ) + 1;

                }
                */
                answers[answerIndex] = mDNSAnswer.FromBytes( data, ref offset );
                answerIndex++;
            }
            /* 
            byte tldLength = data[offset];
            Debug.LogFormat("nameLength={0} tldLength={1}",nameLength,tldLength);
            string fqdn = System.Text.Encoding.ASCII.GetString(data, mDNSDiscovery.FQDNOffset+1, nameLength)+"."+System.Text.Encoding.ASCII.GetString(data, offset+1, tldLength);
            offset += tldLength;
            Debug.LogFormat("============{0}============",fqdn);
            byte[] ipBytes = new byte[4];
            ipBytes[0] = data[offset+mDNSDiscovery.IPAddressOffset+0];
            ipBytes[1] = data[offset+mDNSDiscovery.IPAddressOffset+1];
            ipBytes[2] = data[offset+mDNSDiscovery.IPAddressOffset+2];
            ipBytes[3] = data[offset+mDNSDiscovery.IPAddressOffset+3];
            */
            foreach(var answer in answers){
                if( answer.type == mDNSDiscovery.QueryType.A ){
                    address = answer.ipAddress;            
                    name = answer.requestName;
                }
            }
        }

        public static string GetFQDN(byte[] data, ref int offset)
        {
            int nameOffset = offset;
            int startOffset = offset;
            string name = string.Empty;
            int breakCount = 10;
            
            while( data[nameOffset] != 0 && breakCount!=0){
                Debug.LogFormat( "current offset=0x{0:X} value=0x{1:X}",nameOffset,data[nameOffset] );

                if( data[nameOffset] == 0xc0 ){
                    if( nameOffset >= startOffset ){
                        offset+=1;
                    }
                    nameOffset = data[nameOffset+1];
                }
                int nameLength = data[nameOffset];
                if( name.Length > 0 ){
                    name+=".";
                }
                string namePart = System.Text.Encoding.ASCII.GetString(data, nameOffset+1, nameLength);
                name += namePart;
                Debug.LogFormat( "namePart={0}",namePart );

                nameOffset += 1+nameLength;
                if( nameOffset >= startOffset ){
                    offset = nameOffset;
                }
                breakCount--;
            }

            offset+=1;
            if( breakCount == 0 ){
                Debug.LogError("Packet parsing failed. Failed to parse string");
            }
            Debug.LogFormat("GetFQDN name={0} 0x{1:X}-0x{2:X}",name,startOffset,offset);
            return name;
        }

        public static short GetShort(byte[] data, ref int offset)
        {
            short value = IPAddress.NetworkToHostOrder( BitConverter.ToInt16( data, offset ) );
            Debug.LogFormat("GetShort val=0x{0:X} {1:X}-{2:X}",value,offset,offset+2);
            offset += 2;
            return value;
        }

        public static int GetInt(byte[] data, ref int offset){
            int value = IPAddress.NetworkToHostOrder( BitConverter.ToInt32( data, offset ) );
            Debug.LogFormat("GetInt val=0x{0:X} {1:X}-{2:X}",value,offset,offset+4);
            offset += 4;
            return value;
        }

        public static bool IsResponse(byte[] data)
        {
            uint flags = (uint)BitConverter.ToUInt16(data,mDNSDiscovery.FlagsOffset);
            bool answer = flags == mDNSDiscovery.ResponseFlag;
            if( answer ){
                Debug.Log("Is response packet");
            }
            else {
                Debug.LogFormat("Was not response flags: {0:x2}",flags);

            }
            return answer;

        }
    }

    public struct mDNSAnswer 
    {

        public mDNSDiscovery.QueryType type;
        public mDNSDiscovery.ClassType classType;
        public int TTL;
        public short priority;
        public short weight;
        public short port;
        public string target;

        public string requestName;
        public string name;

        public string text;

        public IPAddress ipAddress;

        public static mDNSAnswer FromBytes(byte[] data, ref int offset)
        {
            var answer =  new mDNSAnswer();
            answer.requestName = mDNSResponse.GetFQDN( data, ref offset );
            answer.type =  (mDNSDiscovery.QueryType) mDNSResponse.GetShort( data, ref offset );
            answer.classType = (mDNSDiscovery.ClassType) mDNSResponse.GetShort( data, ref offset );
            answer.TTL =  mDNSResponse.GetInt( data, ref offset );
            int end = offset + mDNSResponse.GetShort( data, ref offset );
            if( answer.type == mDNSDiscovery.QueryType.SRV ){
                answer.priority = mDNSResponse.GetShort( data, ref offset );
                answer.weight = mDNSResponse.GetShort( data, ref offset );
                answer.port = mDNSResponse.GetShort( data, ref offset );
                answer.target = mDNSResponse.GetFQDN( data, ref offset );
            }
            if( answer.type == mDNSDiscovery.QueryType.PTR ){
                answer.name = mDNSResponse.GetFQDN( data, ref offset );
            }
            if( answer.type == mDNSDiscovery.QueryType.TXT){
                answer.text = mDNSResponse.GetFQDN( data, ref offset );
            }
            if( answer.type == mDNSDiscovery.QueryType.AAAA ){
                byte[] ipAddrBytes = new byte[16];
                Array.Copy(data,offset,ipAddrBytes,0,16);
                offset+=ipAddrBytes.Length;
                answer.ipAddress = new IPAddress( ipAddrBytes );
            }
            if( answer.type == mDNSDiscovery.QueryType.A ){
                byte[] ipAddrBytes = new byte[4];
                Array.Copy(data,offset,ipAddrBytes,0,4);
                offset+=ipAddrBytes.Length;
                answer.ipAddress = new IPAddress( ipAddrBytes );
            }
            //offset = end+1;
            return answer;
        }
    }

    public class mDNSRequest {
        private string name;
        mDNSDiscovery.QueryType type;

        public mDNSRequest(string name, mDNSDiscovery.QueryType type){
            this.name = name;
            this.type = type;
        }

        public byte[] ToByteArray()
        {

            string[] nameParts = name.Split('.');
            var stream = new MemoryStream();
            stream.WriteByte(0);
            stream.WriteByte(0);

            stream.WriteByte(0);
            stream.WriteByte(0);

            stream.WriteByte(0);
            stream.WriteByte(1);

            stream.WriteByte(0);
            stream.WriteByte(0);
            stream.WriteByte(0);
            stream.WriteByte(0);
            stream.WriteByte(0);
            stream.WriteByte(0);

            for(int i=0;i<nameParts.Length;i++){
                byte[] part = Encoding.ASCII.GetBytes( nameParts[i] );
                stream.WriteByte( (byte)nameParts[i].Length );
                stream.Write( part, 0, part.Length );
            }

            stream.WriteByte(0);
            Debug.LogFormat("===>> t={0} i={1}",type,(UInt16)type);
            var writer = new BinaryWriter( stream );
            writer.Write( IPAddress.HostToNetworkOrder((short)type) );
            //var typeBytes = BitConverter.GetBytes( (UInt16)type );
            //stream.WriteByte( typeBytes[1] );
            //stream.WriteByte( typeBytes[0] );


            stream.WriteByte(0);
            stream.WriteByte(1);
            return stream.ToArray();
        }

        public static bool IsQuery(byte[] data)
        {
            uint flags = BitConverter.ToUInt16(data,mDNSDiscovery.FlagsOffset);
            bool answer = flags == mDNSDiscovery.QueryFlag;
            if( answer ){
                Debug.Log("Is query packet");
            }

            return answer;
        }
    }
}

