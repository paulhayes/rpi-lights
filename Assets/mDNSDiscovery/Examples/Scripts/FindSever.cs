using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;

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
    [SerializeField]
    Dropdown typeField;

    string[] names;
    System.Array values;

    mDNS.mDNSDiscovery discovery;

	// Use this for initialization
	void Start () {
        inputField.text = name;
        discovery = new mDNS.mDNSDiscovery();

        discovery.PacketReceived += OnPacketReceived;
        resolveBtn.onClick.AddListener( ()=>{
            name = inputField.text.Trim();
            var type = (mDNS.mDNSDiscovery.QueryType)values.GetValue( typeField.value );
            Debug.LogFormat("type={0}",type);
            discovery.SendRequest(name, type);
            discovery.NameResolvedEvent += OnNameResolved;
        });

        names = System.Enum.GetNames( typeof( mDNS.mDNSDiscovery.QueryType ) );
        values = System.Enum.GetValues( typeof( mDNS.mDNSDiscovery.QueryType ) );
        typeField.AddOptions( names.ToList() );

	}
	
	// Update is called once per frame
	void Update () {
        if( Input.GetKeyDown( KeyCode.Escape ) )
        {
            Application.Quit();
        }   
	}

    void OnNameResolved(System.Net.IPAddress address, string name){
        if( this.name != name ){
            return;
        }        
        discovery.NameResolvedEvent -= OnNameResolved;
        Debug.Log(address);
        outputField.text += string.Format("ip:{0}\n",address);
    }

    void OnPacketReceived(System.Net.IPAddress address, string data, int length){
        debugField.text += string.Format("{0} byes from {1}\n{2}\n",length,address,data);
    }
}
