const wrap = function(index,len){
    return ((index%len)+len)%len;    
}

Number.prototype.wrap = function(len){ wrap(this.valueOf,len) }

module.exports = {
    wrap
}