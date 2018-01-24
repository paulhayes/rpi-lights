using UnityEngine;
using UnityEditor;
using UnityEngine.TestTools;
using NUnit.Framework;
using System.Collections;
using System.IO;
using mDNS;

public class mDNSTests {

    const string testDataPath = "mDNSDiscovery/TestData";

    [Test]
    public void PtrAnswer(){
        var response = new mDNS.mDNSResponse();
        var data = File.ReadAllBytes(PrependTestDataPath("responsePtr.bin"));
        int offset = 0x0C;
        mDNSAnswer answer =  mDNSAnswer.FromBytes( data, ref offset );
        Assert.AreEqual( 0x3A, offset );
        Assert.AreEqual( mDNSDiscovery.QueryType.PTR, answer.type );
    }

    [Test]
    public void IsResponse() {
        var response = new mDNS.mDNSResponse();
        var data = File.ReadAllBytes(PrependTestDataPath("responsePtr.bin"));
        response.FromByteArray( data );
        Assert.IsTrue( mDNS.mDNSResponse.IsResponse( data ) );
    }
      
  	[Test]
	public void AnswerCount() {
        var response = new mDNS.mDNSResponse();
        var data = File.ReadAllBytes(PrependTestDataPath("responsePtr.bin"));
        response.FromByteArray( data );
        Assert.AreEqual( response.answers.Length, 5 );
	}
    
    public string PrependTestDataPath(string file){
        return Path.Combine( Path.Combine( Application.dataPath, testDataPath), file );
    }
}
