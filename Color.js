'use strict';

let toByte = function(channel){
	return Math.floor(0xff*Math.min(1,Math.max(channel,0))) & 0xff;
}

const Color = module.exports = class {

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

	crunch(white){
		let min = Math.min(this.r,this.g,this.b);
		let r = white * this.r;
		let g = white * this.g;
		let b = white * this.b;
		let w = 0;
		if( min > white ){
			w = (min-white)/(1-white);
		}
		return new Color(r,g,b,w);
	}

	toInt(){
		var col = this.balance(1,0.725,0.7,1).gamma(1.5);
		return toByte(col.w)<<24 | toByte(col.r)<<16 | toByte(col.g)<<8 | toByte(col.b);
	}

	balance(vr,vg,vb,vw){
		vr = vr || 1;
		vg = vg || vr;
		vb = vb || vg;
		vw = vw || vb;
		return new Color((this.r*vr),(this.g*vg),(this.b*vb),(this.w*vw));
		
	}

	gamma(vr,vg,vb,vw){
		vr = vr || 1.5;
		vg = vg || vr;
		vb = vb || vg;
		vw = vw || vb;
		let pow = Math.pow;
		return new Color(pow(this.r,vr),pow(this.g,vg),pow(this.b,vb),pow(this.w,vw));
    }
    
    clone(){
        return new Color(this.r,this.g,this.b,this.w);
	}
	
	toString(){
		return `${this.r},${this.g},${this.b},${this.w}`;
  }
  
  toHex(){
    return `#${toByte(this.r)}${toByte(this.g)}${toByte(this.b)}`;
  }

	static fromString(str){
    let [ r, g, b, w ] = str.split(',').map(parseFloat);
    return new Color(r,g,b,w);
	}

	static lerp(color1,color2,t){
		t=Math.min(1,Math.max(0,t));
		return color1.mul(1-t).add( color2.mul(t) );
	}

	static toIntArray(colorArray, intArray){
		if(colorArray instanceof Color){
			colorArray = [colorArray];
		}
		for(let i=0;i<intArray.length;i++){
			intArray[i] = colorArray[i%colorArray.length].toInt();
		}
	}

	static random(minColor,maxColor){
		return minColor.add( maxColor.subtract(minColor).mul( new Color(Math.random(),Math.random(),Math.random(),Math.random()) ) );
	}

	static fromPixelBuffer(buffer,offset){
		let r = buffer.data[offset+0];
		let g = buffer.data[offset+1];
		let b = buffer.data[offset+2];
		return new Color(r/255,g/255,b/255,0);
    }
    
    static createArray(length, color){
        color = color || new Color(0,0,0);
        return new Array(length).fill(color);
	}
	
	 

}

Color.black = new Color(0,0,0,0);