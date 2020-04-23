const fs = require('fs').promises;

var _path;

module.exports = class {
    constructor(path){
      _path = path;
    }
    
    async load(){
      try{
        this.numLights = 576;
        const settingStr = await fs.readFile(_path,"utf8");
        Object.assign(this,JSON.parse(settingStr));
      }
      catch(e){
        console.warn("Error reading JSON settings file");
      }
      
      return this;
    }

    async save(data){
      console.log("settings:");
      console.log(this);
      return await fs.writeFile(_path,data);
    }

    
}