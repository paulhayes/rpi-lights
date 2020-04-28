const wrap = function(index,len){
    return ((index%len)+len)%len;    
}

Number.prototype.wrap = function(len){ wrap(this.valueOf,len) }

const randomRange = function(start,end){
	return Math.floor( start + (Math.random() * (end-start)) );
}


module.exports = {
    wrap,
    randomRange
}