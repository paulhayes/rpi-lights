"use strict";

const Color = require('../Color');

//const color = new Color(0,0,0,200);

module.exports = class {
	
	constructor(name, r,g,b,w){
		this.numPixels;
		if( r instanceof Color ){
			this.color = r;
		}
		else {
			this.color = new Color(r,g,b,w);
		}
		this.name = name || "Off";
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
			"name":this.name,
			"color":this.color.toString()
		}
	}

	setConfig(data){
    this.name = data.name;
    this.color = Color.fromString(data.color);
	}

	getProperties(){
		return [
      {
        "id":"name",
        "label":"Name",
        "type":"text",
        "value":this.name
      },
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