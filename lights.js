"use strict";

const ws281x = require('rpi-ws281x-native');
const http = require('http');
const fileSystem = require('fs');
const path = require('path');
const url = require('url');
const Plain = require('./effects/plain').Plain;
const Fire = require('./effects/fire').Fire;

const NUM_LEDS = parseInt(process.argv[2], 10) || 160;
const STRIP_TYPE = process.argv[3] || "sk6812-grbw";

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
  new Plain("Low white",0,0,0,0.7),
  new Plain("Bright white",0,0,0,1),
  new Plain("red",1,0,0,0),
  new Plain("green",0,1,0,0),
  new Plain("blue",0,0,1,0),
  new Fire()
];
var currentEffect;


effects.forEach((e)=>e.init(NUM_LEDS));

setInterval(function() {

  if( currentEffect != null ){
    currentEffect.update(pixelData);
  }
  /*
  var middlePixel = NUM_LEDS/2;

  //pixelData[middlePixel] = rgbw2Int(0,0,0, Math.floor(128*Math.random())+128 );
  
  for (let i = 0; i < middlePixel; i++) {  
    pixelData[i] = pixelData[i+1];
    pixelData[NUM_LEDS-i-1] = pixelData[NUM_LEDS-i-2];       
  }
  if(Math.random()<0.1){
    pixelData[middlePixel] = rgbw2Int(0,0,0, Math.floor(128*Math.random())+128 );    
  }
  else {
   pixelData[middlePixel] = rgbw2Int(0,0,0, 128 );  
  }


  offset = (offset + 1) % 256;
  //console.log(pixelData);
  */
  ws281x.render();

  inc++;
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');

// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;

  if (pos < 85) {
    return rgb2Int(255 - pos * 3, 0, pos * 3);
  } else if (pos < 170) {
    pos -= 85;
    return rgb2Int(0, pos * 3, 255 - pos * 3);
  } else {
    pos -= 170;
    return rgb2Int(pos * 3, 255 - pos * 3, 0);
  }
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}

function rgbw2Int(r, g, b, w) {
  return ((w & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}


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
  //res.end('Hello World\n');
});

server.listen(80, "0.0.0.0", () => {
  console.log("Server running");
});

