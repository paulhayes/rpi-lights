'use strict';

const ws281x = require('rpi-ws281x-native');

const STRIP_TYPE = "sk6812-grbw";

const Color = require('./Color');
const Plain = require('./effects/plain');
const Effects = new require('./effects/Effects');

/*
const effectTypes = {
    Plain
};
effectTypes.entries.forEach(([k,v]=>v.class=k));
*/

module.exports = class {

    constructor(settings,numLeds){
        
        const channels = ws281x.init({
            dma: 10,
            freq: 800000,
            channels: [{gpio: 18, count: numLeds, invert: false, stripType: STRIP_TYPE}]
          });

        const channel = channels[0];
        this.pixelData = channel.array;

        this.effectStack = [];
        this.numLeds = numLeds;
        
        // ---- trap the SIGINT and reset before exit
        process.on('SIGINT', function() {
            ws281x.reset();
            process.nextTick(function() {
            process.exit(0);
            });
        });

        this.setData(settings);
        this.effects.forEach((e)=>e.init(numLeds));

    }

    get currentEffectIndex(){
        return this.effects.indexOf(this.currentEffect);
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

    pushEffect(){
        if(this.currentEffect!==this.offEffect)
            this.effectStack.push(this.currentEffect);
    }
    
    popEffect(){
        if(this.effectStack.length)
            this.currentEffect = this.effectStack.pop();
    }

    selectEffect(effectIndex){
        if(effectIndex===0){
          this.pushEffect();
        }
        if( effectIndex >= 0 && effectIndex < this.effects.length ){
            this.currentEffect = this.effects[effectIndex];
          }
    }

    getData(){
        return {
            effectIndex:this.currentEffectIndex,
            effects:this.effects.map((effect)=>Effects.toJson(effect))
        }
    }

    setData(settings){      
        if(settings.effects) this.effects = settings.effects.map((data)=>Effects.fromJson(data)).filter((e)=>!!e);
        if(!this.effects || !this.effects.length){
          console.log("no effects found. Creating defaults");
          const offEffect =new Plain();
        
          this.effects = [
            offEffect,
            new Plain("white",new Color(0,0,0,1))
          ];
        }
        this.selectEffect( settings.effectIndex );

    }

        /*
    createEffectFromConfig(c){
        let effect = new effectTypes[c.class];
        effect.setConfig(c);
        return effect;
    }

    getEffectConfig(e){
        let config = e.getConfig();
        config.class = e.class;
        return config;
    }
    */
}