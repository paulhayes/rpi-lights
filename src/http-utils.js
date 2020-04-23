
const Url = require('url');

module.exports = {
    test(){
        console.log("test");
    },

    getQueryProp(url,propName){
        let queryObj = url.parse(req.url,true).query;
          
        return ( propName in queryObj ) ? queryObj[propName] : false ;
    },

    getQueryIntProp(url,propName,base){
        base = base || 10;
        let queryObj = Url.parse(url,true).query;
          
        return ( propName in queryObj ) ? parseInt( queryObj[propName] ) : false ;
    },

    getQueryFloatProp(url,propName){
        let queryObj = url.parse(req.url,true).query;
          
        return ( propName in queryObj ) ? parseFloat(queryObj[propName]) : false ;
    },


    getParamInt(params,propName){
        let val = parseInt( params[propName] );
        return Number.isInteger(val) ? val : false;
    }
}
