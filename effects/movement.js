"use strict";

const Color = require('../Color');
const MovementSensor = require("../movementSensor.js");
//const color = new Color(0,0,0,200);

module.exports = class {
	
	constructor(name, timeout, effect){
		this.numPixels;
		//this.colors;
		//this.color = new Color(r,g,b,w);
		this.name = name || "Off";
		this.brightness = 0;
		this.movementTime = Date.now();
		this.detected = 0;	
		this.timeout = timeout | 10;
		this.effect = effect;	
		MovementSensor(this.onMovement.bind(this));
	}

	init(num){
		this.numPixels = num;
		this.effect.init(num);
	}

	update(pixels){
		let currentTime = Date.now();
		let elapsed = (currentTime - this.movementTime) / 1000.0;

		if( this.detected==0 && elapsed > this.timeout ){
			this.brightness = 0;
		}
		else this.brightness = 1;

		this.effect.update(pixels);
		Color.toIntArray(this.effect.colors.map((c)=>c.mul(this.brightness)), pixels);
	}

	onMovement(value){
		this.detected = value;
		if(value==1) {
			this.movementTime = Date.now();
		}
	}
};