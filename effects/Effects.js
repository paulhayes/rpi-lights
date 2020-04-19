"use strict"

const Plain = require('./plain');

const effectTypes = {
    Plain
}


module.exports = class {
    
    constructor(){
        this.EffectTypes = {
            Plain
        }
        Object.entries(this.EffectTypes).forEach(([k,v])=>v.class=k);
        
    }

    toJson(effect){
        let config = effect.getConfig();
        config.class = effect.class;
        return config;
    }

    fromJson(data){
        let effect = new this.EffectTypes[data.class];
        effect.setConfig(data);
        return effect;
    }
}