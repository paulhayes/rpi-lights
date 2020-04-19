"use strict"

const Plain = require('./plain');

class Effects{
    
    static init(){
        this.types = {
            Plain
        }
        Object.entries(this.types).forEach(([k,v])=>v.class=k);
    }

    static toJson(effect){
        let config = effect.getConfig();
        for(var [className,classConstructor] of Object.entries(this.types)){
          console.log("className",className);
        
          if(effect instanceof classConstructor){
            config.class = className;
            break;
          }
        }
        return config;
    }

    static fromJson(data){
        if(!data.class){
          console.warn("no class found in effect json data");
          return;
        }
        if(!(data.class in this.types)){
          console.warn(`effect class ${data.class} not found`);
          return;
        }
        let effect = new (this.types[data.class]);
        effect.setConfig(data);
        return effect;
    }

}

Effects.init();
module.exports = Effects;