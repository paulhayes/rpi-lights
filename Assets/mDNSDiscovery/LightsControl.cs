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

    IPAddress address;
    public string name = "raspberrypi.local";
    public string[] effects;
    public int selected;

	IEnumerator Start () 
    {
        var discovery = new mDNS.mDNSDiscovery();
        discovery.NameResolvedEvent += OnIpAddress;
        discovery.SendRequest(name);
        yield return new WaitUntil(()=>address != null);

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

    void OnIpAddress(IPAddress addr){
        Debug.LogFormat("OnIpAddress {0}",addr);
        address = addr;
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
