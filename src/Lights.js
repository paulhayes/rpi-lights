'use strict';

const ws281x = require('rpi-ws281x-native');

const STRIP_TYPE = "sk6812-grbw";

const Color = require('./Color');
const Pattern = require('./pattern');
const uid = require('uid');

const offEffectId = 'off';

module.exports = class {

    constructor(settings){
        this.settings = settings;
        settings.stripType = settings.stripType || STRIP_TYPE;
        const channels = ws281x.init({
            dma: 10,
            freq: 800000,
            channels: [{gpio: 18, count: settings.numLights, invert: false, stripType:settings.stripType}]
          });

        const channel = channels[0];
        this.pixelData = channel.array;
        this.lastTime = Date.now();
        this.lastEffect = null;
        
        // ---- trap the SIGINT and reset before exit
        process.on('SIGINT', function() {
            ws281x.reset();
            process.nextTick(function() {
            process.exit(0);
            });
        });

        this.setData(settings);

    }

    get currentEffect(){
        return this.effects[this.currentEffectId];
    }

    run(){
        if(!this.running){
            this.running = true;
            this.updateImmediate = setImmediate(this.update.bind(this));
        }

    }

    update(){
        let time = Date.now();
        let deltaTime = ( time - this.lastTime ) /1000;
        this.lastTime = time;
        
        if( this.currentEffect != null ){
          this.currentEffect.update(this.pixelData,deltaTime);
        }
        
        ws281x.render();
      
        this.updateImmediate = setImmediate(this.update.bind(this));
    }

    stop(){
        if(this.running){
            this.running = false;
            clearImmediate(this.updateImmediate);
        }
    }

    addEffect(){
        let pattern = new Pattern(this.settings);
        let id  = uid();
        this.effects[id] = pattern;

        return id;
    }

    pushEffect(){
        if(this.currentEffect!==this.offEffect)
            this.lastEffect = this.currentEffect;
    }
    
    popEffect(){
        if(this.lastEffect!==null)
            this.currentEffectId = this.lastEffect;
    }

    selectEffect(effectId){
        
        if( effectId in this.effects ){
            if(effectId === offEffectId){
                this.pushEffect();
            }
            this.currentEffectId = effectId;
            return effectId;
        }
        else {
            console.warn(`Effect with id ${effectId} not found`);
        }
        return null;
    }

    hasEffect(effectId){
        return ( effectId in this.effects );
    }

    deleteEffect(effectId){
        if(effectId==offEffectId){
            return;
        }
        if( effectId in this.effects ){
            
            let indexOfEffect = Object.keys(this.effects).indexOf(effectId);   
            delete this.effects[effectId];
            let keys = Object.keys(this.effects); 
            if(this.currentEffectId===effectId){
                this.currentEffectId = keys[Math.min(indexOfEffect,keys.length)];
            }
        }
    }

    getData(){
        let effects = {};
        Object.entries(this.effects).forEach(([effectKey,effect])=>{
            effects[effectKey] = effect.toJson();
        });
        
        return {
            effectIndex:this.currentEffectId,
            effects
        }
    }

    setData(settings){   
        let serializedEffectsType = typeof(settings.effects);
        if(Array.isArray( settings.effects ))
            serializedEffectsType = 'array';
        this.effects = {};
        if(serializedEffectsType==='array'){
            
            const effectsArr = settings.effects.map((data)=>new Pattern(this.settings).fromJson(data)).filter((e)=>!!e);
            
            effectsArr.forEach((e,i)=>{
                this.effects[i==0?offEffectId:uid()] = e;                
            });
        }
        else if(serializedEffectsType==='object'){
            Object.keys( settings.effects ).forEach((k,i)=>{
                this.effects[k] = new Pattern(settings).fromJson( settings.effects[k] );
            });
        }

        if(Object.keys(this.effects).length===0){
          console.log("no effects found. Creating defaults");
          const offEffect = new Pattern(settings,"off","Plain");
        
          this.effects = {};
          this.effects[offEffectId] = offEffect;
          this.effects[uid()] = new Pattern(settings,"white","Plain",new Color(0,0,0,1))
        }
        let selectedEffectId = (settings.effectId in this.effects) ? settings.effectId : offEffectId;
        this.selectEffect( selectedEffectId );

    }

    save(){
        this.settings.save(this.getData());
    }

}