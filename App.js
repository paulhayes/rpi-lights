import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
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


const rpi_light_address = "192.168.5.68";
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
  constructor(props){
    super(props);
    this.state = {options:[
    ]};
    var main = this;
    //this.setState({appState: state});
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
  componentDidMount() {
    
  }
  render(){

    let optionButton = ({item, index, separators})=> (<Button raised primary text={item.title} onPress={sendLightOption.bind(null,item.key)}/>);
    /*
      <View style={{flex:2, backgroundColor: 'white'}}>
      <Toolbar leftElement="menu"></Toolbar>  
      </View>
     */

    return (      
      <ThemeContext.Provider value={getTheme(uiTheme)} >
      <StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true} />
      <View style={styles.container}>
          <View style={{flex:2, backgroundColor: 'white'}}>
            <FlatList data={this.state.options} renderItem={optionButton} />
          </View>          
      </View>
      </ThemeContext.Provider>
    );
    
  }
};


var sendLightOption = function(index){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://"+rpi_light_address+"/select?"+encodeQueryData({option:index}), true);
  xhttp.send();
}

var getLightOptions = function(){
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

function encodeQueryData(data) {
  let ret = [];
  for (let d in data){
   ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}