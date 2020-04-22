"use strict";

const path = require('path');
const rpio = require('rpio');

/*
const ColorTest = require('./effects/colorTest.js');
const GammaTest = require('./effects/gammaTest.js');
const Daylight = require('./effects/daylight');
const Movement = require('./effects/movement');
const Fire = require('./effects/fire');
const Wave = require('./effects/wave');
const Disco = require('./effects/disco');
const Chase = require('./effects/chase.js');
const Scroll = require('./effects/scroll');
const Random = require('./patterns/Random');
*/

const settingsPath = './light-settings.json';
const settings = new (require('./Settings'))(settingsPath);
const NUM_LEDS = 576;

const Lights = require('./Lights');
const LightingServer = require('./LightServer');

process.chdir(__dirname);

/*
var effects = [
  new Plain(),
  new Daylight( 'Daylight', path.join(__dirname, "img/horizonOverTime.png"), "4:43", "21:21", 10 ),
  new Daylight( 'Daylight test', path.join(__dirname, "img/horizonOverTime.png"), "21:42", "21:43", 0.1 ),
  new Chase('Chase Yellow/Red', new Color(0.4,0.2,0,0),new Color(1,0.1,0.1,0), new Color(0,0,0,0), 3, 50, 40),
  new Plain("low white",0,0,0,0.7),
  new Plain("bright white",0,0,0,1),
  new Plain("red",1,0,0,0),
  new Plain("green",0,1,0,0),
  new Plain("low green",0,0.5,0,0),
  new Plain("blue",0,0,1,0),
  new Plain("low yellow",0.2,0.15,0,0),
  new Plain("bright yellow",1,0.5,0,0),
  //new Movement("movement",60,new Plain("low white",0,0,0,0.7)),
  //new Movement("movement",60,new Plain("low white",0,0,0,0.7)),
  new Fire(),
  new Fire("Blue fire",new Color(0,0,0.8,0.2),new Color(0,0,0.2,0)),
  new Fire("Green fire",new Color(0,0.8,0,0.2),new Color(0,0.2,0,0)),
  new Scroll("Random Scroll", new Random(NUM_LEDS,new Color(0,0,0,0),new Color(0,0,1,0.8)), 20),
  new Scroll("Random Scroll", new Random(NUM_LEDS,new Color(0,0,0,0),new Color(1,0,1,0)), 20),
  new Wave("Orange wave",new Color(0,0,0,0),new Color(1,0.5,0,0), 1, 1),
  new Disco("Disco"),
  new ColorTest(),
  new GammaTest(),
  new GammaTest("gamma 1/4 ",1,4),
  new GammaTest("gamme 3/4 ",3,4),
  new GammaTest("full ",4,4)
];
*/




async function main(){
  
  await settings.load();
  const lights = new Lights(settings,NUM_LEDS);
  const server = new LightingServer(settings,lights);
  const externalSwitchPin = 11;

  lights.run();
  
  console.log('Press <ctrl>+C to exit.');

  function onExternalSwitchChange(pin){
    let isOn = rpio.read(pin) === rpio.LOW;
    if(isOn ){
      lights.popEffect();
    }
    else if(!isOn){
      lights.pushEffect();
      lights.selectEffect(0);
    }
  }
  
  rpio.open(externalSwitchPin, rpio.INPUT);
  rpio.poll(externalSwitchPin, onExternalSwitchChange);
}


if(!module.parent){
  main();
}




