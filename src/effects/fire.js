"use strict";

const Color = require('../Color');
const { wrap } = require('./effect-utils')

let randomRange = function(start,end){
	return Math.floor( start + (Math.random() * (end-start)) );
}

module.exports = class {

	constructor(warmColor,coldColor){
		this.numLights;

		this.coldColor = coldColor || new Color(0.3,0,0,0.01);
		this.warmColor = warmColor || new Color(1,0.4,0,0);
	}

	init(num){
		this.numLights = num || 0;
		this.currentColors = new Float32Array(this.numLights);
		this.lastColors = new Float32Array(this.numLights);
		this.tempColors = new Float32Array(this.numLights);
        
		
	}

	update(pixels){

		for(let i=0;i<this.numLights;i++){
			let left = wrap(i-1);
			let right = wrap(i+1);
			this.tempColors[i] = this.currentColors[i] + ( this.currentColors[i] - this.lastColors[i] ) ;
			this.tempColors[i] *= 0.99;

			if( Math.random() < 0.0025 ){
				this.tempColors[i] += 0.1;
			}
		}

		for(let i=0;i<this.numLights;i++){
			this.lastColors[i] = this.currentColors[i];
			this.currentColors[i] = this.tempColors[i];
		}

		let wobble = randomRange(-1,2);
		for(let i=0;i<this.numLights;i++){
			let j = wrap(i+wobble);
			if( this.currentColors[i] > this.currentColors[j] ){
				//this.lastColors[j] = this.lastColors[i];
				//this.currentColors[j] = this.currentColors[i];

			}
		}


		Color.toIntArray(Array.from(this.currentColors,c=>this.warmColor.mul(c).add(this.coldColor) ), pixels);
	}

 	
	getConfig(){
		return {
			"warmColor":this.warmColor.toString(),
			"coldColor":this.coldColor.toString()
		}
	}

	setConfig(data){
		if('warmColor' in data){
			this.warmColor = Color.fromString(data.warmColor);
		}
		if('coldColor' in data){
			this.coldColor = Color.fromString(data.coldColor);
		}
		this.init(this.numLights);
	}

	getProperties(){
		return [      
			{
				"id":"warmColor",
				"label":"Warm Color",
				"type":"color",
				"value":this.warmColor.toString(),
			},
			{
				"id":"coldColor",
				"label":"Cold Color",
				"type":"color",
				"value":this.coldColor.toString()
			}
		]
	}

	static getDescription(){
		return "Fire";
	}

};