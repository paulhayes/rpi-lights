let toByte = function(channel){
	return Math.floor(0xff*Math.min(1,Math.max(channel,0))) & 0xff;
}

let Color = exports.Color = class {

	constructor(r,g,b,w){


		

		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
		this.w = w || 0;
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
		return toByte(this.w)<<24 | toByte(this.r)<<16 | toByte(this.g)<<8 | toByte(this.b);
	}

	gamma(value){
		let pow = Math.pow;
		return new Color(pow(this.r,1.5),pow(this.g,1.5),pow(this.b,1.5),pow(this.w,1.5));
	}

	static toIntArray(colorArray, intArray){
		for(let i=0;i<colorArray.length;i++){
			intArray[i] = colorArray[i].toInt();
		}
	}

}