const fs = require('fs').promises;

module.exports = class {
    constructor(path){
      this.path = path;
    }
    async load(){
      console.log(fs);
      try{
        const settingStr = await fs.readFile(this.path,"utf8");
        Object.assign(this,JSON.parse(settingStr));
      }
      catch(e){
        console.warn("Error reading JSON settings file");
      }
      
      return this;
    }

    async save(data){
      return await fs.writeFile(this.path,data);
    }

    
}