'use strict';

const Pattern = require('./Pattern');
const Color = require('../Color');

module.exports = class Random extends Pattern
{

	constructor(num,minColorRange,maxColorRange){
		super();
		this.numPixels = num;
		this.colors = Array.from( new Array(num),()=>{
			return Color.random(minColorRange,maxColorRange);
		});
	}


}
