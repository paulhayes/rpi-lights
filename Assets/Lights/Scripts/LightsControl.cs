using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.Net;
using UnityEngine.Networking;

public class LightsControl : MonoBehaviour 
{

    [SerializeField]
    Dropdown optionsDropdown;

    [SerializeField]
    Dropdown deviceDropdown;

    IPAddress address;

    [SerializeField]
    string deviceName = "raspberrypi.local";
    [SerializeField]
    mDNS.mDNSDiscovery.QueryType type;
    public string[] effects;
    public int selected;

    List<IPAddress> matchedAddresses;

	void Start () 
    {
        matchedAddresses = new List<IPAddress>();
        var discovery = new mDNS.mDNSDiscovery();
        discovery.NameResolvedEvent += OnIpAddress;
        discovery.SendRequest(deviceName, type);
        deviceDropdown.ClearOptions();
        deviceDropdown.onValueChanged.AddListener(  OnDeviceChanged );
        
	}
	
    IEnumerator UpdatePatternList(){
        Debug.Log("refresahing pattern list");
        string url = string.Format("http://{0}/options",address.ToString());
        Debug.Log(url);
        using (UnityWebRequest www = UnityWebRequest.Get(url))
        {
            yield return www.Send();

            if (www.isError)
            {
                Debug.Log(www.error);
            }
            else
            {
                // Show results as text
                Debug.Log(www.downloadHandler.text);
                JsonUtility.FromJsonOverwrite(www.downloadHandler.text,this);
                // Or retrieve results as binary data
                //byte[] results = www.downloadHandler.data;
                optionsDropdown.AddOptions(new List<string>(effects));
                optionsDropdown.value = selected;
                optionsDropdown.onValueChanged.AddListener(OnSelectionChange);
            }
        }
    }

	void Update () 
    {
        if( Input.GetKeyDown( KeyCode.Escape ) )
        {
            Application.Quit();
        }   
	}

    void OnIpAddress(IPAddress addr, string name){
        Debug.LogFormat("OnIpAddress {0}",addr);
        bool isFirstAddress = ( address == null );
        
        if(isFirstAddress){
            address = addr;
            StartCoroutine( UpdatePatternList() );
        }
        
        matchedAddresses.Add( addr );
        deviceDropdown.AddOptions( new List<string>(){ name } );

     
    }

    void OnDeviceChanged(int deviceIndex){
        address = matchedAddresses[deviceIndex];
        StartCoroutine( UpdatePatternList() );
    }

    void OnSelectionChange(int value){
        StartCoroutine( SelectOptionCoroutine(value) );
    }

    IEnumerator SelectOptionCoroutine(int value){
        string url = string.Format("http://{0}/select?option={1}",address,value);

        using (UnityWebRequest www = UnityWebRequest.Get(url))
        {
            yield return www.Send();

            if (www.isError)
            {
                Debug.Log(www.error);
            }
            else
            {
                // Show results as text
                Debug.Log(www.downloadHandler.text);
                // Or retrieve results as binary data
                //byte[] results = www.downloadHandler.data;

            }
        }

    }
}
