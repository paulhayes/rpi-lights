"use strict";

const Color = require('../Color');

//const color = new Color(0,0,0,200);

module.exports = class {
    
	constructor(name, color1, color2, color3, speed){
		this.numLights;
        this.colors;
        this.pos = 0;
        this.speed = speed;
        this.color1 = color1 || new Color();
        this.color2 = color2 || new Color();
        this.color3 = color3 || new Color(); 
        this.length = 50;
        this.tail = 40;
	}

	init(num){
		this.numLights = num;
		this.colors = new Array(this.numLights).fill(this.color1);
	}

	update(pixels){
        for(var i=0;i<this.length;i++){
            var j=(this.pos+i) % this.numLights;
            this.colors[j] = this.color1;            
        }
        this.pos+=this.speed;
        for(var i=0;i<this.length;i++){
            var j=(this.pos+i) % this.numLights;
            if(i<this.tail){
                var t=1.0*i/this.tail;
                this.colors[j] = Color.lerp( this.color1, this.color2, t );            

            }
            else if( i>=this.length-5 ){
                this.colors[j] = this.color3;
            }
            else {
                this.colors[j] = this.color2       ;           
            }
        }
        Color.toIntArray(this.colors, pixels);
    }
    
    
	getConfig(){
		return {
			"color1":this.color1.toString(),
			"color2":this.color2.toString(),
			"color3":this.color3.toString(),
			"length":this.length,
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
        if('color3' in data){
			this.color3 = Color.fromString(data.color3);
		}
		if('length' in data){
			this.length = data.length;
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
				"id":"color3",
				"label":"Color 3",
				"type":"color",
				"value":this.color3.toString()
			},
			{
				"id":"length",
				"label":"Length",
				"type":"number",
				"min":0,
				"max":this.numLights,
				"value":this.length	
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
		return "Chase";
	}
};