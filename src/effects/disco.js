"use strict";

const Color = require('../Color');
const PropertyParser = require('./property-parser');
const { wrap, randomRange } = require('./effect-utils');


module.exports = class {
  
	constructor(name){
        const propertyParser = new PropertyParser(this);
        this.propertyParser = propertyParser;
        this.name = name;
        this.backgroundColor = Color.fromHex("#1B3649");
        this.color1 = Color.fromHex("#0FC0FC");
        this.color2 = Color.fromHex("#7B1DAF");
        this.color3 = Color.fromHex("#FF2FB9");
        this.color4 = Color.fromHex("#D4FF47");
        
        propertyParser.addColor('backgroundColor',"Background Color");
        propertyParser.addColor('color1',"Color 1");
        propertyParser.addColor('color2',"Color 2");
        propertyParser.addColor('color3',"Color 3");
        propertyParser.addColor('color4',"Color 4");
        propertyParser.addRange('changeRate',"Speed",0,1,0.01);
        propertyParser.addInt('illuminatedWidth',"Illuminated Width");
        propertyParser.addInt('bands',"Bands");
        this.changeRate = 0.3;
        this.illuminatedWidth = 16;
        this.bands = 5;
	}

	init(num){
        this.numPixels = num;
        this.elapsed = 0;
        this.colors = Color.createArray(this.numPixels);	
        this.cols = [this.color1,this.color2,this.color3,this.color4];	
	}

	update(pixels,deltaTime){
        this.elapsed += deltaTime;

        if( this.elapsed > this.changeRate ){
            this.elapsed = 0;

            this.colors.fill(this.backgroundColor);
            for(let j=0;j<this.bands;j++){
                let startIndex = randomRange(0,this.numPixels-1);                
                let endIndex = Math.min( startIndex + this.illuminatedWidth, this.numPixels-1);
                let colorIndex = randomRange(0,this.cols.length);

                for(let i=startIndex;i<=endIndex;i++){
                    this.colors[i] = this.cols[colorIndex];
                }    
            }
        }
		
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
		return "Disco";
	}
};