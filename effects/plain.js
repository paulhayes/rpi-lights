"use strict";

const Color = require('../Color').Color;

//const color = new Color(0,0,0,200);

exports.Plain = class {
	
	constructor(name, r,g,b,w){
		this.numPixels;
		this.colors;
		this.color = new Color(r,g,b,w);
		this.name = name || "Off";
	}

	init(num){
		this.numPixels = num;
		this.colors = new Array(this.numPixels).fill(this.color);
	}

	update(pixels){
		Color.toIntArray(this.colors, pixels);
	}
};