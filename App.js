import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Picker,
  StatusBar,
  FlatList
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { ThemeContext, getTheme, Button, Toolbar } from 'react-native-material-ui';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Zeroconf from 'react-native-zeroconf';

const zeroconf = new Zeroconf();

var rpi_light_address = null //"192.168.5.68";
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
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});

export default class Main extends React.Component {
  state = 
  {
    options:[],
    services:[],
    lightOptionIndex:0
  }
  constructor(props){
    super(props);

    
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
    xhttp.open("GET", "http://"+rpi_light_address+"/options", true);
    xhttp.send();
    */
  }
  componentDidMount() {
    zeroconf.on('start', () => console.log('The scan has started.'));
    zeroconf.on('found', (e) => console.log('found',e) );
    zeroconf.on('resolved', this.updateServices.bind(this) );
    zeroconf.on('error',(e)=>console.log('error',e));
    zeroconf.on('stop',e=>console.log(e));
    zeroconf.on('update', (e)=>console.log('updated',e));

    zeroconf.scan('lights', 'tcp', 'local.');
  }
  updateServices(){
    console.log("Updating services list");
    let services = zeroconf.getServices();
    
    this.setState(prevState=>({
      options:prevState.options,
      services:Object.values(services),
      lightOptionIndex:prevState.lightOptionIndex
    }));
  }
  setLight(address, index){
    rpi_light_address = address;
    this.getLightOptions();
  }
  sendLightOption(index){
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://"+rpi_light_address+"/select?"+encodeQueryData({option:index}), true);
    xhttp.send();
    this.setState(prevState=>({
      services:prevState.services,
      options:prevState.options,
      lightOptionIndex:index
    }));
  }
  
  getLightOptions(){
    if(!rpi_light_address)
      return;
    var main = this;
    var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        console.log( this.status );
        if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          console.log(main.state);
          let options = data.effects.map((item,index)=>{
            return { title:item,  key:index.toString() };
          });
          main.setState(prevState=>({
            options : options,
            services : prevState.services,
            lightOptionIndex:data.selected
          }));
          
          console.log('options',data.effects);
        }
      };
      xhttp.open("GET", "http://"+rpi_light_address+"/options", true);
      xhttp.send();
  }
  getLightOptions(){
    if(!rpi_light_address)
      return;
    var main = this;
    var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        console.log( this.status );
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
      xhttp.open("GET", "http://"+rpi_light_address+"/options", true);
      xhttp.send();
  }
  render(){

    let optionButton = ({item, index, separators})=> (<Button raised {...((index==this.state.lightOptionIndex)?{"accent":true}:{"primary":true})} text={item.title} onPress={this.sendLightOption.bind(this,item.key)}/>);
    /*
      <View style={{flex:2, backgroundColor: 'white'}}>
      <Toolbar leftElement="menu"></Toolbar>  
      </View>
     */
    var main = this;
    
    let lightServiceItems = this.state.services.map( (s, i) => {
      console.log(s);
      return <Picker.Item key={i} value={s.addresses[0].toString()} label={s.name} />
    });

    return (      
      <ThemeContext.Provider value={getTheme(uiTheme)} >
      <StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true} />
      <View style={styles.container}>
          <View style={{flex:2, backgroundColor: 'white'}}>
            <Picker onValueChange={main.setLight.bind(this)}>
              {lightServiceItems}
            </Picker>

            <FlatList data={this.state.options} renderItem={optionButton} />
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