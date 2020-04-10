"use strict";

const Color = require('../Color');

let randomRange = function(start,end){
	return Math.floor( start + (Math.random() * (end-start)) );
}

module.exports = class {
    
	constructor(name){
        
        this.name = name;
        this.white = new Color(0,0,0,1);
        this.black = new Color(0,0,0.2,0);
        this.changeRate = 0.3;
        this.elapsed = 0;
        this.illuminatedWidth = 16;
        this.bands = 5;
	}

	init(num){
		this.numPixels = num;
		this.colors = Color.createArray(this.numPixels);
		
	}

	update(pixels,deltaTime){
        this.elapsed += deltaTime;

        if( this.elapsed > this.changeRate ){
            this.elapsed = 0;

            this.colors.fill(this.black);
            for(let j=0;j<this.bands;j++){
                let startIndex = randomRange(0,this.numPixels-1);
                let endIndex = Math.min( startIndex + this.illuminatedWidth, this.numPixels-1);
                for(let i=startIndex;i<=endIndex;i++){
                    this.colors[i] = this.white;
                }    
            }
        }
		
        Color.toIntArray(this.colors, pixels);
        
        
	}

	wrap(index){
		while( index < 0 ){
			index+=this.numPixels;
		}
		return index % this.numPixels;
	}
};