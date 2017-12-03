"use strict";

const ws281x = require('rpi-ws281x-native');
const http = require('http');
const fileSystem = require('fs');
const path = require('path');
const url = require('url');
const Plain = require('./effects/plain').Plain;
const Fire = require('./effects/fire').Fire;

const NUM_LEDS = 160;
const STRIP_TYPE = "sk6812-grbw";

const channels = ws281x.init({
  dma: 5,
  freq: 800000,
  channels: [{gpio: 18, count: NUM_LEDS, invert: false, stripType: STRIP_TYPE}]
});

const channel = channels[0];
const pixelData = channel.array;

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function() {
  ws281x.reset();
  process.nextTick(function() {
    process.exit(0);
  });
});

// ---- animation-loop
let offset = 0;
let inc = 0;


var effects = [
  new Plain(),
  new Plain("low white",0,0,0,0.7),
  new Plain("bright white",0,0,0,1),
  new Plain("red",1,0,0,0),
  new Plain("green",0,1,0,0),
  new Plain("blue",0,0,1,0),
  new Plain("low yellow",0.2,0.15,0,0),
  new Plain("bright yellow",1,0.5,0,0),
  new Fire()
];
var currentEffect;


effects.forEach((e)=>e.init(NUM_LEDS));

setInterval(function() {

  if( currentEffect != null ){
    currentEffect.update(pixelData);
  }
  
  ws281x.render();

  inc++;
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');


function returnIndex(res){
  var filePath = path.join(__dirname, 'index.html');
  var stat = fileSystem.statSync(filePath);
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', stat.size);
  var readStream = fileSystem.createReadStream(filePath);
  readStream.pipe(res);
}

function returnOptions(res){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(effects) );
}

function parseOption(obj,res){
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify({status:'okay'}) );
  console.log(obj);
  if( obj.option ){
    let effectIndex = parseInt(obj.option,10);
    if( effectIndex > 0 && effectIndex < effects.length ){
      currentEffect = effects[effectIndex];
    }
  }
}

const server = http.createServer((req, res) => {
  var urlInfo = url.parse(req.url,true);
  if( urlInfo.pathname === "/" ){
    returnIndex(res);
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
