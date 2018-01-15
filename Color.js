'use strict';

let toByte = function(channel){
	return Math.floor(0xff*Math.min(1,Math.max(channel,0))) & 0xff;
}

let Color = module.exports = class {

	constructor(r,g,b,w){
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
		this.w = w || 0;

		//This is meant to be an immutable class right?
		Object.freeze(this);
	}

	mul(color){
		if(typeof color === 'number'){
			return new Color(this.r*color,this.g*color,this.b*color,this.w*color);
		} 
		else if( color instanceof Color){
			return new Color(this.r*color.r,this.g*color.g,this.b*color.b,this.w*color.w);
		}
		else {
			throw new Error('Color.mul recieved invalid arguments');

		}
	}

	add(color){
		if(typeof color === 'number'){
			return new Color(this.r+color,this.g+color,this.b+color,this.w+color);
		} 
		else if( color instanceof Color){
			return new Color(this.r+color.r,this.g+color.g,this.b+color.b,this.w+color.w);
		}
		else {
			throw new Error('Color.add recieved invalid arguments');
		}
	}

	subtract(color){
		if(typeof color === 'number'){
			return new Color(this.r-color,this.g-color,this.b-color,this.w-color);
		} 
		else if( color instanceof Color){
			return new Color(this.r-color.r,this.g-color.g,this.b-color.b,this.w-color.w);
		}
		else {
			throw new Error('Color.add recieved invalid arguments');
		}	
	}

	toInt(){
		var col = this.gamma(1.5);
		return toByte(col.w)<<24 | toByte(col.r)<<16 | toByte(col.g)<<8 | toByte(col.b);
	}

	gamma(value){
		let pow = Math.pow;
		return new Color(pow(this.r,1.5),pow(this.g,1.5),pow(this.b,1.5),pow(this.w,1.5));
	}

	static lerp(color1,color2,t){
		t=Math.min(1,Math.max(0,t));
		return color1.mul(1-t).add( color2.mul(t) );
	}

	static toIntArray(colorArray, intArray){
		for(let i=0;i<colorArray.length;i++){
			intArray[i] = colorArray[i].toInt();
		}
	}

	static random(minColor,maxColor){
		return minColor.add( maxColor.subtract(minColor).mul( new Color(Math.random(),Math.random(),Math.random(),Math.random()) ) );
	}

}

Color.black = new Color(0,0,0,0);