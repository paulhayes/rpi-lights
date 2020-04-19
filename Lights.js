'use strict';

const ws281x = require('rpi-ws281x-native');

const STRIP_TYPE = "sk6812-grbw";

const Color = require('./Color');
const Plain = require('./effects/plain');
const Effects = new (require('./effects/Effects'))();
/*
const effectTypes = {
    Plain
};
effectTypes.entries.forEach(([k,v]=>v.class=k));
*/

module.exports = class {

    constructor(settings,numLeds){

        this.setData(settings);

        
        const channels = ws281x.init({
            dma: 10,
            freq: 800000,
            channels: [{gpio: 18, count: numLeds, invert: false, stripType: STRIP_TYPE}]
          });

        const channel = channels[0];
        this.pixelData = channel.array;

        const offEffect =new Plain();
        this.effects = [
            offEffect,
            new Plain("red",new Color(1,0,0))
        ];
        

        this.effectStack = [];
        this.numLeds = numLeds;
        this.effects.forEach((e)=>e.init(numLeds));

        // ---- trap the SIGINT and reset before exit
        process.on('SIGINT', function() {
            ws281x.reset();
            process.nextTick(function() {
            process.exit(0);
            });
        });
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
        this.selectEffect( settings.effectIndex );
        if(settings.effects) this.effects = settings.effects.map((data)=>Effects.fromJson(data));
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