"use strict";

const Color = require('../Color').Color;

let randomRange = function(start,end){
	return Math.floor( start + (Math.random() * (end-start)) );
}

exports.Fire = class {

	constructor(){
		this.numPixels;
		this.currentColors = new Array();
		this.lastColors = new Array();
		this.tempColors = new Array();
		this.name = "Fire";

		
	}

	init(num){
		this.numPixels = num || 0;
		for(let i=0;i<this.numPixels;i++){
			this.currentColors.push( new Color() );
			this.lastColors.push( new Color() );
			this.tempColors.push( new Color() );
		}

	}

	update(pixels){

		
		let decay = new Color(0.95,0.8,0.8,0);
		for(let i=0;i<this.numPixels;i++){
			let wobble = 0; //randomRange(-1,2);
			let j = this.wrap(i+wobble);
			let left = this.wrap(j-1);
			let right = this.wrap(j+1);
			this.tempColors[i] = this.currentColors[j].add( this.currentColors[j].subtract( this.lastColors[j]) ).mul(decay) ;
			//this.tempColors[i] = this.tempColors[i].mul(3/4).add( this.currentColors[left].mul(1/8) ).add( this.currentColors[right].mul(1/8) );

			if( Math.random() < 0.005 ){
				this.tempColors[i] = new Color(0.5,0.25,0,0);
			}
		}

		for(let i=0;i<this.numPixels;i++){
			this.lastColors[i] = this.currentColors[i];
			this.currentColors[i] = this.tempColors[i];
		}


		Color.toIntArray(this.currentColors.map(c=>c.gamma(1.5)), pixels);
	}

 	wrap(index){
		while( index < 0 ){
			index+=this.numPixels;
		}
		return index % this.numPixels;
	}

};