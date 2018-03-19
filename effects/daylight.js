"use strict";

const Color = require('../Color');
const fs = require('fs');
const parsePng = require('parse-png');

module.exports = class {
	
	constructor(name, imagePath, startTime, endTime, updateInterval){
		this.colors;
		this.startTime = startTime.split(":").map(t=>parseInt(t)).reduce((minutes,seconds)=>1000*(60*minutes+seconds));
		this.endTime = endTime.split(":").map(t=>parseInt(t)).reduce((minutes,seconds)=>1000*(60*minutes+seconds));
		this.elapsed = 0;
		this.updateInterval = updateInterval || 1;
		this.name = name || "Off";
		parsePng(fs.readFileSync(imagePath)).then(png=>this.image);
	}

	init(num){
		this.numPixels = num;
		this.colors = new Array(this.numPixels).fill(new Color());
	}

	update(pixels,deltaTime){
		
		this.elapsed -= deltaTime;
		if( this.elapsed <= 0 ){
			this.elapsed += this.updateInterval;
			calcColors();
			Color.toIntArray(this.colors, pixels);
		}

	}

	calcColors(){
		let now = new Date();
		let midnightLast = new Date();
		midnightLast.setHours(0,0,0,0);
		let timeSinceMidnight = now.getTime() - midnightLast.getTime();
		let t = ( timeSinceMidnight - this.startTime ) / ( this.endTime - this.startTime );
		if( t < 0 ) t = 0;
		if( t > 1 ) t = 1;
		for(let i=0;i<this.numPixels;i++){			
			let x = Math.floor( this.image.width * i/(this.numPixels-1) );
			let y = Math.floor( this.image.height * t );
			let i = x + y * this.image.width;
			let r = this.image.data[i+0];
			let g = this.image.data[i+1];
			let b = this.image.data[i+2];
			this.colors.r = r / 255;
			this.colors.g = g / 255;
			this.colors.b = b / 255;
			
		}
	}
	
};