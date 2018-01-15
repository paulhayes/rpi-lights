const Color = require('../Color');

module.exports = class Pattern{

	getColor(index){
		if( !( 'colors' in this ) )
			return Color.black;

		let num = this.colors.length;
		return this.colors
	}

	wrap(index){
		return ((index%this.numPixels)+this.numPixels)%this.numPixels;
	}


}