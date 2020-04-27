"use strict";

const Color = require('../Color');

module.exports = class {
	
	constructor(r,g,b,w){
		
		if( r instanceof Color ){
			this.color = r;
		}
		else {
			this.color = new Color(r,g,b,w);
		}
		
	}

	init(num){
		this.numPixels = num;
		//this.colors = new Array(this.numPixels).fill(this.color);
	}

	update(pixels){
		Color.toIntArray(this.color, pixels);
	}

	getConfig(){
		return {
			"color":this.color.toString()
		}
	}

	setConfig(data){
		if('color' in data){
			this.color = Color.fromString(data.color);
		}
	}

	getProperties(){
		return [      
			{
				"id":"color",
				"label":"Color",
				"type":"color",
				"value":this.color.toString()
      		}      
		]
	}

	static getDescription(){
		return "Single Color";
	}
};