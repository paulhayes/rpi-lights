const PropertyParser = require('./property-parser');

const Color = require('../Color');

module.exports =class {
    constructor(){
        
        this.propertyParser = new PropertyParser(this);
        this.propertyParser.addString('startCode','Start Code',true);
        this.propertyParser.addString('updateCode','Update Code',true);
        this.startCode = `
            //args = numPixels       
            // start coe here
        `;

        this.updateCode = `
            // args = pixels, deltaTime
            //update code here
        `;
    }

    init(numPixels){
        this.scope = {};
        this.numPixels = numPixels;
        this.colors = new Array(this.numPixels).fill(new Color());
        try{
            this.startFunc = new Function("numPixels",this.startCode).bind(this.scope);
            this.updateFunc = new Function("pixels","deltaTime","Color",this.updateCode).bind(this.scope);
            this.startFunc(numPixels);
        }
        catch(e){
            console.warn(e);
        }
    }

    update(pixels,deltaTime){
        
        try {
            if(this.updateFunc){
                this.updateFunc(this.colors,deltaTime,Color);
            }    
            Color.toIntArray(this.colors, pixels);
        }
        catch(e){
            console.warn(e);

        }
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
		return "Custom";
	}
}