using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class FindSever : MonoBehaviour {

    [SerializeField]
    string name = "raspberrypi.local";

    [SerializeField]
    InputField inputField;
    [SerializeField]
    Text outputField;
    [SerializeField]
    Button resolveBtn;
    [SerializeField]
    Text debugField;

	// Use this for initialization
	void Start () {
        inputField.text = name;
        var discovery = new mDNS.mDNSDiscovery();
        discovery.NameResolvedEvent += OnNameResolved;
        discovery.PacketReceived += OnPacketReceived;
        resolveBtn.onClick.AddListener( ()=>{
            name = inputField.text.Trim();
            discovery.SendRequest(name);

        });
	}
	
	// Update is called once per frame
	void Update () {
        if( Input.GetKeyDown( KeyCode.Escape ) )
        {
            Application.Quit();
        }   
	}

    void OnNameResolved(System.Net.IPAddress address){
        Debug.Log(address);
        outputField.text += string.Format("ip:{0}\n",address);
    }

    void OnPacketReceived(System.Net.IPAddress address, string data, int length){
        debugField.text += string.Format("{0} byes from {1}\n{2}\n",length,address,data);
    }
}
