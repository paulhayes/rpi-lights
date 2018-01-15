"use strict";

const Color = require('../Color');

//const color = new Color(0,0,0,200);

module.exports = class {
	
	constructor(name, color1, color2, width){
		this.color1 = color1;
		this.color2 = color2;
		this.name = name || "Wave";
		this.offset = 0;
		this.width = width;
	}

	init(num){
		this.numPixels = num;
		this.values = new Float32Array(this.numPixels);
		this.width = this.width || this.numPixels;
				
		for(let i=0;i<num;i++){
			this.values[i] = 0.5+0.5*Math.sin((i/(this.width)+Math.round(this.offset))/(2*Math.PI));
		}

		this.colors = Array.from(this.values,c=>Color.lerp(this.color1,this.color2,c) );
	}

	update(pixels){
		
		
		let num = this.numPixels;
		let last = this.colors[this.wrap(-1)];
		for(let i=0;i<num;i++){
			let tmp = this.colors[i];
			this.colors[i] = last;
			last = tmp;
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