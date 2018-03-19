"use strict";
const fs = require('fs');
const ws281x = require('rpi-ws281x-native');
const http = require('http');
const fileSystem = require('fs');
const path = require('path');
const url = require('url');
const Plain = require('./effects/plain');
const ColorTest = require('./effects/colorTest.js');
const GammaTest = require('./effects/gammaTest.js');
const Daylight = require('./effects/daylight');
const Movement = require('./effects/movement');
const Fire = require('./effects/fire');
const Wave = require('./effects/wave');
const Chase = require('./effects/chase.js');
const Scroll = require('./effects/scroll');
const Color = require('./Color');
const Random = require('./patterns/Random');
const settingsPath = '/boot/light-settings.json';
const NUM_LEDS = 576;
const STRIP_TYPE = "sk6812-grbw";

const channels = ws281x.init({
  dma: 10,
  freq: 800000,
  channels: [{gpio: 18, count: NUM_LEDS, invert: false, stripType: STRIP_TYPE}]
});

const channel = channels[0];
const pixelData = channel.array;
let lastTime = Date.now();

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function() {
  ws281x.reset();
  process.nextTick(function() {
    process.exit(0);
  });
});

/*
process.once('SIGUSR2', function () {
    ws281x.reset();
    process.kill(process.pid, 'SIGUSR2');
});
*/

// ---- animation-loop
let offset = 0;
let inc = 0;


var effects = [
  new Plain(),
  new Daylight( 'Daylight', path.join(__dirname, "img/horizonOverTime.png"), "4:43", "21:21", 10 ),
  new Daylight( 'Daylight test', path.join(__dirname, "img/horizonOverTime.png"), "21:42", "21:43", 0.1 ),
  new Chase('Chase Yellow/Red', new Color(0.4,0.2,0,0),new Color(1,0.1,0.1,0), new Color(0,0,0,0), 3, 50, 40),
  new Plain("low white",0,0,0,0.7),
  new Plain("bright white",0,0,0,1),
  new Plain("red",1,0,0,0),
  new Plain("green",0,1,0,0),
  new Plain("blue",0,0,1,0),
  new Plain("low yellow",0.2,0.15,0,0),
  new Plain("bright yellow",1,0.5,0,0),
  new Movement("movement",60,new Plain("low white",0,0,0,0.7)),
  new Movement("movement",60,new Plain("low white",0,0,0,0.7)),
  new Fire(),
  new Fire("Blue fire",new Color(0,0,0.8,0.2),new Color(0,0,0.2,0)),
  new Scroll("Random Scroll", new Random(NUM_LEDS,new Color(0,0,0,0),new Color(0,0,1,0.8)), 20),
  new Scroll("Random Scroll", new Random(NUM_LEDS,new Color(0,0,0,0),new Color(1,0,1,0)), 20),
  new Wave("Orange wave",new Color(0,0,0,0),new Color(1,0.5,0,0), 1, 1)
  new ColorTest(),
  new GammaTest(),
  new GammaTest("gamma 1/4 ",1,4),
  new GammaTest("gamme 3/4 ",3,4),
  new GammaTest("full ",4,4),
];
var currentEffect;


effects.forEach((e)=>e.init(NUM_LEDS));

setInterval(function() {
  let time = Date.now();
  let deltaTime = ( time - lastTime ) /1000;
  lastTime = time;

  if( currentEffect != null ){
    currentEffect.update(pixelData,deltaTime);
  }
  
  ws281x.render();

  inc++;
}, 30);

console.log('Press <ctrl>+C to exit.');


function returnFile(res,file,mime){
  var filePath = path.join(__dirname, file);
  var stat = fileSystem.statSync(filePath);
  console.log(filePath,stat.size);
  res.statusCode = 200;
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Length', stat.size);
  var readStream = fileSystem.createReadStream(filePath);
  readStream.pipe(res);
}

function returnOptions(res){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  let currentIndex = Math.max(0, effects.indexOf(currentEffect));

  res.end( JSON.stringify({ effects:effects.map(e=>e.name), selected:currentIndex }));
}

function parseOption(obj,res){
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify({status:'okay'}) );
  console.log(obj);
  if( 'option' in obj ){
    let effectIndex = parseInt(obj.option,10);
    selectEffect(effectIndex);
    fs.writeFile(settingsPath,JSON.stringify({effectIndex:effectIndex}));
  }
}

function selectEffect(effectIndex){
  if( effectIndex >= 0 && effectIndex < effects.length ){
      currentEffect = effects[effectIndex];
    }
}

const server = http.createServer((req, res) => {
  var urlInfo = url.parse(req.url,true);
  if( urlInfo.pathname === "/" ){
    returnFile(res,'index.html','text/html');
  }
  else if( urlInfo.pathname === "/favicon.png" ){
    returnFile(res,'favicon.png','image/png');
  }
  else if( urlInfo.pathname === "/options" ){
    returnOptions(res);
  }
  else if( urlInfo.pathname === "/select" ){
    
    parseOption(urlInfo.query,res);
  }
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type','text/plain');
    res.end("File Not Found");
  }  
});

server.listen(80, "0.0.0.0", () => {
  console.log("Server running");
});

fs.readFile(settingsPath, (e,data)=>{
    try {
      selectEffect( JSON.parse(data).effectIndex);
    }
    catch(e){
      console.warn("Error reading JSON settings file");
    }

})
