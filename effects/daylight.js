"use strict";

const Color = require('../Color');
const fs = require('fs');
const parsePng = require('parse-png');

module.exports = class {
	
	constructor(name, imagePath, startTime, endTime, updateInterval){
		this.colors;
		this.startTime = startTime.split(":").map(t=>parseInt(t)).reduce((hours,minutes)=>1000*(3600*hours + 60*minutes));
		this.endTime = endTime.split(":").map(t=>parseInt(t)).reduce((hours,minutes)=>1000*(3600*hours + 60*minutes));
		this.elapsed = 0;
		this.updateInterval = updateInterval || 1;
		this.name = name || "Off";
		var instance = this;
		parsePng(fs.readFileSync(imagePath)).then(png=>instance.image=png);
	}

	init(num){
		this.numPixels = num;
		this.colors = new Array(this.numPixels).fill(new Color());
	}

	update(pixels,deltaTime){
		
		this.elapsed -= deltaTime;
		if( this.elapsed <= 0 ){
			this.elapsed += this.updateInterval;
			this.calcColors();
			Color.toIntArray(this.colors, pixels);
		}

	}

	calcColors(){
		if( !this.image ){
			console.warn("daylight image not loaded. Can't calc colors")
			return;
		}
		let now = new Date();
		let midnightLast = new Date();
		midnightLast.setHours(0,0,0,0);
		let timeSinceMidnight = now.getTime() - midnightLast.getTime();
		let t = ( timeSinceMidnight - this.startTime ) / ( this.endTime - this.startTime );
		t=((t%1)+1)%1;
		if( t < 0 ) t = 0;
		if( t > 1 ) t = 1;
		let y = Math.floor( (this.image.height-1) * t );
		//console.log(y,t);
		for(let index=0;index<this.numPixels;index++){
			let x = Math.floor( this.image.width * index/(this.numPixels-1) );
			
			let i = (x + y * this.image.width)<<2;
			let i2 = (x + (y+1) * this.image.width)<<2;

			/*let r = this.image.data[i+0];
			let g = this.image.data[i+1];
			let b = this.image.data[i+2];
			this.colors[index] = new Color(r/255,g/255,b/255,0);
			*/
			let c1 = Color.fromPixelBuffer(this.image,i);
			let c2 = Color.fromPixelBuffer(this.image,i2);
			
			this.colors[index] = Color.lerp(c1,c2,0.5).crunch(0.9);
		}
	}
	
};