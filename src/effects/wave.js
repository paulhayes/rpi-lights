"use strict";

const Color = require('../Color');
const { wrap } = require('./effect-utils');

module.exports = class {
	
	constructor(color1, color2, width, speed){
		this.color1 = color1 || new Color(1,0,0,0);
		this.color2 = color2 || new Color(0,1,0,0);
		this.offset = 0;
		this.width = width || 5;
		this.speed = speed || 1;
	}

	init(num){
		this.numLights = num;
		const values = new Float32Array(this.numLights);
		this.width = this.width || this.numLights;
		
		for(let i=0;i<num;i++){
			values[i] = 0.5+0.5*Math.cos((i/this.width)*(2*Math.PI));
		}
		
		this.colors = Array.from(values,c=>Color.lerp(this.color1,this.color2,c) );
		
	}

	update(pixels){			
		let num = this.numLights;
		
		let speed = Math.round(-this.speed);
		let dir = speed/Math.abs(speed);
		for(let i=0;i<num;i++){
			let pos = (dir==1?i:num-i);
			let j = wrap(pos,num);
			let k = wrap(pos+speed,num);
			
			this.colors[j] = this.colors[k];
		}
		
		Color.toIntArray(this.colors, pixels);
	}

	getConfig(){
		return {
			"color1":this.color1.toString(),
			"color2":this.color2.toString(),
			"width":this.width,
			"speed":this.speed
		}
	}

	setConfig(data){
		if('color1' in data){
			this.color1 = Color.fromString(data.color1);
		}
		if('color2' in data){
			this.color2 = Color.fromString(data.color2);
		}
		if('width' in data){
			this.width = data.width;
		}
		if('speed' in data){
			this.speed = data.speed;
		}
		this.init(this.numLights);
	}

	getProperties(){
		return [      
			{
				"id":"color1",
				"label":"Color 1",
				"type":"color",
				"value":this.color1.toString(),
			},
			{
				"id":"color2",
				"label":"Color 2",
				"type":"color",
				"value":this.color2.toString()
			},
			{
				"id":"width",
				"label":"Width",
				"type":"number",
				"min":0,
				"max":this.numLights,
				"value":this.width	
			},
			{
				"id":"speed",
				"label":"Speed",
				"type":"number",
				"min":-10,
				"max":10,
				"value":this.speed	
			}
		]
	}

	static getDescription(){
		return "Wave";
	}

	
};