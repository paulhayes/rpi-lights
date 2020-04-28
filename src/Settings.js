const fs = require('fs').promises;

var _path;

module.exports = class {
    constructor(path){
      _path = path;
      this.numLights = 576;
      this.effects = [];
    }
    
    async load(){
      try{
        const settingStr = await fs.readFile(_path,"utf8");
        let data = JSON.parse(settingStr);
        this.assign(data);
        //Object.assign(this,data);
      }
      catch(e){
        console.warn("Error reading JSON settings file");
      }
      
      return this;
    }

    async save(data){
      this.assign(data); 
      return await fs.writeFile(_path,JSON.stringify(this));
    }

    assign(source){
      let keysInBoth = Object.keys(this).filter((k)=>(k in source));
      let target = this;
      keysInBoth.forEach((k)=>target[k]=source[k]);
    }
}