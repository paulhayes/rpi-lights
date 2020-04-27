"use strict";

const Color = require('../Color');

//const color = new Color(0,0,0,200);

module.exports = class {
	
	constructor(name, r,g,b,w){
		this.numPixels;
		this.colors;
		this.name = name || "Color Test";
	}

	init(num){
		this.numPixels = num;
        this.colors = new Array(this.numPixels).fill(new Color());
        let cols = [
            new Color(1,0,0,0),
            new Color(0,1,0,0),
            new Color(0,0,1,0),
			new Color(1,1,1,0),
			new Color(0,0,0,1)
        ];
        let block = Math.floor(this.numPixels/cols.length);
        let band = Math.floor( block * 0.9 ); 
        for(let i=0;i<cols.length;i++){

            for(let j=0;j<band;j++){
                let index = block*i+j;
                let c = cols[i].mul(j/(band-1));
                this.colors[index] = c;
            }
        }
	}

	update(pixels){
		Color.toIntArray(this.colors, pixels);
	}
};