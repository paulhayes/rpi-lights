"use strict";

const Color = require('../Color');

const PropertyParser = require('./property-parser');

module.exports = class {
	
	constructor(name, numerator, demoninator){
        const propertyParser = new PropertyParser(this);
        this.propertyParser = propertyParser;
        propertyParser.addRange('gamma','Gamma',0,2,0.01);
        propertyParser.addInt('dem','brightness fraction',1,20);
        this.numPixels;
        this.colors;
        this.gamma = 1.5;
        this.num = numerator || 1;
        this.dem = demoninator || 2;
		this.name = name || "Gamma Test";
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
                let c = cols[i].mul(this.num/this.dem);
                if( j>(band/2) ){
                    c = ((index%this.dem)<this.num) ? cols[i] : Color.black;
                }
                this.colors[index] = c;
            }
        }
	}

	update(pixels){
        Color.gamma = this.gamma;        
		Color.toIntArray(this.colors, pixels);
    }
    
    
	getConfig(){
		return this.propertyParser.toJson();
		
	}

	setConfig(data){
		this.propertyParser.fromJson(data);
		
		this.init(this.numPixels);
	}

	getProperties(){
		return this.propertyParser.getProperties();
		
	}

	static getDescription(){
		return "Gamma Test";
	}
};