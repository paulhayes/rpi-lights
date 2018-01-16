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

        public event System.Action<IPAddress> NameResolvedEvent;
        public event System.Action<IPAddress,string,int> PacketReceived;

        public class RequestInfo {
            public UdpClient client;
            public string name;
        }

        public void SendRequest(string name)
        {
            IPAddress multicastAddress = IPAddress.Parse(addr);
            var udpClient = new UdpClient(port, AddressFamily.InterNetwork);
            //udpClient.ExclusiveAddressUse = false;

            udpClient.JoinMulticastGroup(multicastAddress);
            IPEndPoint remoteep = new IPEndPoint(multicastAddress, port);


            mDNSRequest request = new mDNSRequest(name);
            Debug.Log("Sending request");

            byte[] requestBytes = request.ToByteArray();
            Debug.Log( ByteArrayToString(requestBytes) );

            var requestInfo = new RequestInfo(){
                name=name,
                client = udpClient
            };

            udpClient.BeginSend(requestBytes, requestBytes.Length, remoteep, ReceiveAsync, requestInfo);
        }

        private void ReceiveAsync(IAsyncResult result)
        {
            RequestInfo requestInfo = result.AsyncState as RequestInfo;
            requestInfo.client.EndSend(result);
            Debug.Log("Waiting for receive");
            string address = addr;
            //var host = Dns.GetHostEntry(Dns.GetHostName()); host.AddressList;

            /*List<IPAddress> localAddresses = new List<IPAddress>();
            foreach (NetworkInterface netInterface in NetworkInterface.GetAllNetworkInterfaces())
            {
                
            }

            */
            IPAddress multicastAddress = IPAddress.Parse(address);
            var udpClient = new UdpClient(AddressFamily.InterNetwork);
            //udpClient.ExclusiveAddressUse = false;
            udpClient.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            udpClient.Client.Bind(new IPEndPoint(IPAddress.Any, port));
            udpClient.JoinMulticastGroup(multicastAddress);

            requestInfo.client = udpClient;

            udpClient.BeginReceive(OnReceiveSink,requestInfo);
        }

        private void OnReceiveSink(IAsyncResult result)
        {
            

            IPEndPoint ep = null;
            RequestInfo requestInfo = result.AsyncState as RequestInfo;
            var session = requestInfo.client;
            //var local = (IPEndPoint) args[1];

            byte[] buffer = session.EndReceive(result, ref ep);
            string dataStr = ByteArrayToString(buffer);
            //Do what you want here with the data of the buffer
            PacketReceived.Invoke(ep.Address, dataStr, buffer.Length);

            Debug.Log("Message received from " + ep + "  length="+buffer.Length);
            Debug.Log( dataStr );
            Debug.Log( ep.ToString() );


            if( mDNSResponse.IsResponse( buffer ) ){
                var response = new mDNSResponse();

                response.FromByteArray(buffer);
                Debug.Log(response.name +" "+response.address.ToString());
                Debug.LogFormat( ">>>> {1} : {0}",response.address, response.name );
                if(NameResolvedEvent != null) 
                    NameResolvedEvent.Invoke(response.address);
            }

            //We make the next call to the begin receive
            //session.BeginReceive(OnReceiveSink, args);
            session.Close();

        }

        public static string ByteArrayToString(byte[] ba)
        {
          StringBuilder hex = new StringBuilder(ba.Length * 2);
          foreach (byte b in ba)
            hex.AppendFormat("{0:x2} ", b);
          return hex.ToString();
        }
    }

    class mDNSResponse {
        public string name;
        public IPAddress address;
        public int TTL;
        public int IPClass;

        public void FromByteArray(byte[] data)
        {
            int offset = mDNSDiscovery.FQDNOffset;
            byte nameLength = data[mDNSDiscovery.FQDNOffset];
            offset += nameLength+1;
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
            address = new IPAddress( ipBytes );
            name = fqdn;
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

    class mDNSRequest {
        private string name;

        public mDNSRequest(string name){
            this.name = name;
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

            byte[] part0 = Encoding.ASCII.GetBytes( nameParts[0] );
            byte[] part1 = Encoding.ASCII.GetBytes( nameParts[1] );

            stream.WriteByte( (byte)nameParts[0].Length );
            stream.Write( part0, 0, part0.Length );
            stream.WriteByte( (byte)nameParts[1].Length );
            stream.Write( part1, 0, part1.Length );

            stream.WriteByte(0);

            stream.WriteByte(0);
            stream.WriteByte(1);

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

