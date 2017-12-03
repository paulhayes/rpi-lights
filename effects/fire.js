"use strict";

const Color = require('../Color').Color;

let randomRange = function(start,end){
	return Math.floor( start + (Math.random() * (end-start)) );
}

exports.Fire = class {

	constructor(){
		this.numPixels;
		this.name = "Fire";

		
	}

	init(num){
		this.numPixels = num || 0;
		this.currentColors = new Float32Array(this.numPixels);
		this.lastColors = new Float32Array(this.numPixels);
		this.tempColors = new Float32Array(this.numPixels);

		this.coldColor = new Color(0.3,0,0,0.01);
		this.warmColor = new Color(1,0.4,0,0);
	}

	update(pixels){

		for(let i=0;i<this.numPixels;i++){
			let left = this.wrap(i-1);
			let right = this.wrap(i+1);
			//this.tempColors[i] = this.currentColors[j].add( this.currentColors[j].subtract( this.lastColors[j]) ).mul(decay) ;
			//this.tempColors[i] = this.tempColors[i].mul(3/4).add( this.currentColors[left].mul(1/8) ).add( this.currentColors[right].mul(1/8) );
			this.tempColors[i] = this.currentColors[i] + ( this.currentColors[i] - this.lastColors[i] ) ;
			this.tempColors[i] *= 0.99;

			if( Math.random() < 0.0025 ){
				this.tempColors[i] += 0.1;
			}
		}

		for(let i=0;i<this.numPixels;i++){
			this.lastColors[i] = this.currentColors[i];
			this.currentColors[i] = this.tempColors[i];
		}

		let wobble = randomRange(-1,2);
		for(let i=0;i<this.numPixels;i++){
			let j = this.wrap(i+wobble);
			if( this.currentColors[i] > this.currentColors[j] ){
				//this.lastColors[j] = this.lastColors[i];
				//this.currentColors[j] = this.currentColors[i];

			}
		}


		Color.toIntArray(Array.from(this.currentColors,c=>this.warmColor.mul(c).add(this.coldColor).gamma(1.5) ), pixels);
	}

 	wrap(index){
		while( index < 0 ){
			index+=this.numPixels;
		}
		return index % this.numPixels;
	}

};