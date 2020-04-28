"use strict";

const Color = require('../Color');

module.exports = class {

    constructor(effect){
        this.effect = effect;
        this.properties = [];
    }

    addInt(id,label,min,max){
        let type = "number";
        this.properties.push({
            id,
            label,
            type,
            min,
            max,
            step:1
        });
    }

    addFloat(id,label,min,max){
        let type = "number";
        this.properties.push({
            id,
            label,
            type,
            min,
            max
        });
    }

    addRange(id,label,min,max,step){
        let type = "range";
        this.properties.push({
            id,
            label,
            type,
            min,
            max,
            step
        });
    }

    addColor(id,label){
        let type = "color";
        this.properties.push({
            id,
            label,
            type            
        });
    }

    addString(id,label,multiline){
        let type = multiline ? "textarea":"text";
        this.properties.push({
            id,
            label,
            type
        });
    }

    fromJson(data){
        this.properties.forEach((prop)=>{
            if(prop.id in data){
                if(prop.type === 'color'){
                    this.effect[prop.id] = Color.fromString(data[prop.id]);
                } 
                else if(prop.type === 'text' || prop.type === 'textarea'){
                    this.effect[prop.id] = data[prop.id].toString();
                }
                else {
                    let val = data[prop.id];
                    if(typeof(val)!=='number'){
                        val = parseFloat(val);
                    }
                    if(isNaN(val)){
                        val = 0;
                    }

                    if(prop.min){
                        let min = prop.min;
                        if(typeof(min)==='function'){
                            min = prop.min();
                        }
                        val = Math.max(min,val);
                    }
                    if(prop.max){
                        let max = prop.max;
                        if(typeof(max)==='function'){
                            max = prop.max();
                        }
                        val = Math.min(prop.max,val);                        
                    }
                    this.effect[prop.id] = val;

                }
            }
        });
    }

    toJson(){
        let data = {};
        const numTypes = ['number','range'];
        this.properties.map((prop)=>[prop.id,this.getPropertyValue(prop)]).forEach(([id,value])=>{
            data[id] = value;
        });

        return data;
    }

    getPropertyValue(prop){
        let value;
        if(prop.type === 'color'){
            value = this.effect[prop.id].toString();
        }
        else {
            value = this.effect[prop.id];
        }

        return value;
    }

    getProperties(){
        let props = this.properties.map((o)=>Object.assign({},o));
        props.forEach((prop)=>{
            for(var k in prop){
                if(typeof(prop[k])==='function'){
                    prop[k] = prop[k]();
                }
            }
            prop.value = this.getPropertyValue(prop);
        });
        return props;
    }



    
}