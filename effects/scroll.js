'use strict';
const Color = require('../Color');

module.exports = class {


	constructor(name,pattern,speed){
		this.name = name || "Scroll";
		this.speed = speed || 1;
		this.pattern = pattern;
		this.time = 0;
	}

	init(num){
		this.numPixels = num;
	}

	update(pixels,deltaTime){
		this.time += deltaTime;
		let pos = Math.round( this.speed * this.time );
		let num = pixels.length;
		for(let i=0;i<num;i++){
			pixels[i] = this.pattern.colors[ this.pattern.wrap(i+pos) ].toInt();
		}
	}

}