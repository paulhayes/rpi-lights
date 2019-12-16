import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Picker,
  StatusBar,
  FlatList,
  Button  
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { ThemeContext, getTheme, Toolbar } from 'react-native-material-ui';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Icon from 'react-native-vector-icons/FontAwesome';
import Zeroconf from 'react-native-zeroconf';


var rpiLightAddress = null //"192.168.5.68";
let options = [];

const uiTheme = {
  palette: {
  },
  statusBar: {
    height: StatusBar.currentHeight
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: '#ecf0f1',
    paddingTop: StatusBar.currentHeight    
  },
  lightSelectContainer: {
    flex: 1,
    flexDirection:'row',
    backgroundColor: '#ecf0f1',
    height:200

  },
  lightOptionsContainer: {
    flex:11
  },
  lightSettingsContainer: {
    flex:2
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  buttonSelected:{
    color:'#DA5932'
  },
  buttonUnselected:{
    marginBottom:10,
    padding:10
  }
});

export default class Main extends React.Component {
  state = 
  {
    options:[],
    services:[],
    lightOptionIndex:0
  }
  zeroconf = new Zeroconf()

  constructor(props){
    super(props);

    //zeroconf.on('update', (e)=>console.log('updated',e));

    
    var main = this;
    //this.setState({appState: state});
    this.getLightOptions();
    /*
    var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
      //console.log( this.status );
	    if (this.readyState == 4 && this.status == 200) {
	    	var data = JSON.parse(this.responseText);
        console.log(main.state);
        main.state.options = data.effects.map((item,index)=>{
          return { title:item,  key:index.toString() };
        });
        main.setState(main.state);
        
        console.log('options',data.effects);
	    }
	  };
    xhttp.open("GET", "http://"+rpiLightAddress+"/options", true);
    xhttp.send();
    */
  }
  componentDidMount() {
    let zeroconf = this.zeroconf;
    zeroconf.on('start', () => console.log('The scan has started.'));
    //zeroconf.on('found', (e) => console.log('found',e) );
    zeroconf.on('resolved', this.updateServices.bind(this) );
    zeroconf.on('error',(e)=>console.log('error',e));
    zeroconf.on('stop',e=>console.log('stopping scan',e));


    zeroconf.scan('lights', 'tcp', 'local.');
  }
  componentWillUnmount() {
    this.zeroconf.removeAllListeners();
  }
  rescan(){
    
    this.zeroconf.stop();
    this.zeroconf.scan('lights', 'tcp', 'local.');

  }
  updateServices(){
    //console.log("Updating services list");
    let services = this.zeroconf.getServices();
    let firstService = Object.values(services)[0];
    console.log("updateServices",this.state.options,firstService);
    if(this.state.options.length==0 && firstService){
      console.log('address',firstService.addresses[0].toString());
      rpiLightAddress = firstService.addresses[0].toString()
      this.getLightOptions();
    }
    this.setState(prevState=>({
      options:prevState.options,
      services:Object.values(services),
      lightOptionIndex:prevState.lightOptionIndex
    }));
  }
  setLight(address, index){
    console.log("setLight",address,index);
    if(index>=0){
      rpiLightAddress = address;
      this.getLightOptions();  
    }
  }
  sendLightOption(index){
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://"+rpiLightAddress+"/select?"+encodeQueryData({option:index}), true);
    xhttp.send();
    this.setState(prevState=>({
      services:prevState.services,
      options:prevState.options,
      lightOptionIndex:index
    }));
  }
  
  getLightOptions(){
    if(!rpiLightAddress)
      return;
    console.log("get light options");
    var main = this;
    var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          let options = data.effects.map((item,index)=>{
            return { title:item,  key:index.toString() };
          });
          main.setState(prevState=>({
            options : options,
            services : prevState.services,
            lightOptionIndex:data.selected
          }));
          
        }
      };
      xhttp.open("GET", "http://"+rpiLightAddress+"/options", true);
      xhttp.send();
  }
  render(){

    let optionButton = ({item, index, separators})=> {
      let color = (index==this.state.lightOptionIndex)?styles.buttonSelected.color:styles.buttonUnselected.color;
      //raised={false} type='clear'
      return (<View style={{paddingBottom:2}}><Button  color={color} title={item.title} onPress={this.sendLightOption.bind(this,item.key)}/></View>);
    }
      /*
      <View style={{flex:2, backgroundColor: 'white'}}>
      <Toolbar leftElement="menu"></Toolbar>  
      </View>
     */
    var main = this;
    
    let lightServiceItems = this.state.services.map( (s, i) => {
      return <Picker.Item key={i} value={s.addresses[0].toString()} label={s.name} />
    });

    let noLightsFound = lightServiceItems.length==0;

    if(noLightsFound){
      lightServiceItems.push( <Picker.Item key={-1} label="Searching for lights" /> );
    } else {

    }
    return (      
      <ThemeContext.Provider value={getTheme(uiTheme)} >
      <StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true} />
      
  
      <View style={styles.container}>          
          <View style={styles.lightSelectContainer}>
            <Icon.Button style={{flex:1}} borderRadius={0} name="refresh" onPress={main.rescan.bind(main)} />
            
            <View style={{flex:5, backgroundColor: 'white'}}>
            
              <Picker onValueChange={main.setLight.bind(this)} enabled={!noLightsFound}>
                {lightServiceItems}
              </Picker>
                        
            </View> 
          </View>
          <View style={styles.lightOptionsContainer}>
            <FlatList data={this.state.options} renderItem={optionButton} />
          </View>  
          <View style={styles.lightSettingsContainer}>
            
          </View>         
      </View>
      </ThemeContext.Provider>
    );
    
  }
};




function encodeQueryData(data) {
  let ret = [];
  for (let d in data){
   ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}