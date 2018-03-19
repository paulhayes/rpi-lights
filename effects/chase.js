"use strict";

const Color = require('../Color');

//const color = new Color(0,0,0,200);

module.exports = class {
    
	constructor(name, color1, color2, color3, speed){
		this.numPixels;
        this.colors;
        this.pos = 0;
        this.speed = speed;
        this.color1 = color1;
        this.color2 = color2;
        this.color3 = color3;
        this.name = name || "Off";
        this.length = 50;
        this.tail = 40;
	}

	init(num){
		this.numPixels = num;
		this.colors = new Array(this.numPixels).fill(this.color1);
	}

	update(pixels){
        for(var i=0;i<this.length;i++){
            var j=(this.pos+i) % this.numPixels;
            this.colors[j] = this.color1;            
        }
        this.pos+=this.speed;
        for(var i=0;i<this.length;i++){
            var j=(this.pos+i) % this.numPixels;
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
};