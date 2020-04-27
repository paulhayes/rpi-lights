"use strict";

const Color = require('../Color');
const { wrap } = require('./effect-utils');
const PropertyParser = require('./property-parser');

module.exports = class {
    
	constructor(backgroundColor, headColor, tailColor){
		const propertyParser = new PropertyParser(this);
		propertyParser.addColor('backgroundColor',"Background Color");
		propertyParser.addColor('headColor',"Head Color");
		propertyParser.addColor('tailColor',"Tail Color");
		propertyParser.addInt('head','Head',0);
		propertyParser.addInt('body','Body',0);
		propertyParser.addInt('tail','Tail',0);
		propertyParser.addInt('speed','Speed');
		this.propertyParser = propertyParser;

		this.numLights;
        this.colors;
        this.pos = 0;
        this.speed = 4;
        this.backgroundColor = backgroundColor || new Color();
        this.headColor = headColor || new Color(1,0.7,0,0);
        this.tailColor = tailColor || new Color(0.9,0,0); 
		this.head = 3;
        this.body = 5;
		this.tail = 20;
	}

	init(num){
		this.numLights = num;
		this.colors = new Array(this.numLights).fill(this.backgroundColor);
	}

	update(pixels){
		let length = this.body + this.head + this.tail;
        for(var i=0;i<length;i++){
            var j=wrap(this.pos+i,this.numLights);
            this.colors[j] = this.backgroundColor;            
        }
		this.pos+=this.speed;
		
		let offset = 0;
		for(var i=offset;i<(offset+this.tail);i++){
			var j=wrap(this.pos+i,this.numLights);
			//this.colors[j] = this.tailColor;  
			var t=1.0*(i-offset)/this.tail;
			this.colors[j] = Color.lerp( this.backgroundColor, this.tailColor, t );        
		}

		offset += this.tail;

		for(var i=offset;i<(offset+this.body);i++){
			var j=wrap(this.pos+i,this.numLights);
			var t=1.0*(i-offset)/this.body;
			this.colors[j] = Color.lerp( this.tailColor, this.headColor, t );            
		}

		offset += this.body;

		for(var i=offset;i<(offset+this.head);i++){
			var j=wrap(this.pos+i,this.numLights);
			this.colors[j] = this.headColor;
		}

        Color.toIntArray(this.colors, pixels);
    }
    
    
	getConfig(){
		return this.propertyParser.toJson();
		
	}

	setConfig(data){
		this.propertyParser.fromJson(data);
		
		this.init(this.numLights);
	}

	getProperties(){
		return this.propertyParser.getProperties();
		
	}

	static getDescription(){
		return "Chase";
	}
};