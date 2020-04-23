"use strict"

const Plain = require('./effects/plain');

module.exports = class {

    constructor(settings,name,effectType,...effectArgs){

        this.types = {
            Plain
        }

        effectType = effectType || "Plain";
        
        this.settings = settings;
        this.name = name || "new";
        
        this.selectEffect(effectType,effectArgs);
    }

    update(...args){
        this.effect.update(...args);
    }

    selectEffect(effectType,effectArgs){
        if(effectType in this.types){
            this.effect = new ( this.types[effectType] )(...effectArgs); 
            this.effectType = effectType;    
        }
        else {
            throw new Error("Effect not found");
        }
    }

    toJson(){
        let name = this.name;
        let effectType = this.effectType;
        let config = {
            name,
            effectType
        }
        let effectConfig = this.effect.getConfig();
        
        Object.assign(config,effectConfig);
        return config;
    }

    fromJson(data){
        if('effectType' in data){
          this.effectType = data.effectType || Object.keys( this.types )[0];
          this.effect = new (this.types[this.effectType]);
          this.effect.init(this.settings.numLights);  
        }
        if('name' in data){
          this.name = data.name || this.name;

        }
        this.effect.setConfig(data);  
        return this;
    }

    getProperties(){
        let props = [
            {
                "id":"name",
                "label":"Name",
                "type":"text",
                "value":this.name
            },
            {
                "id":"effectType",
                "label":"type",
                "type":"select",
                "value":this.effectType,
                "options":Object.keys(this.types).map((k)=>{
                    return [k,this.types[k].getDescription()];
                })
            }
        ]
        let effectProps = this.effect.getProperties();
        props = props.concat(effectProps);
        return props;
    }

}