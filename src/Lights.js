'use strict';

const ws281x = require('rpi-ws281x-native');

const STRIP_TYPE = "sk6812-grbw";

const Color = require('./Color');
const Pattern = require('./pattern');

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

        this.effectStack = [];
        
        // ---- trap the SIGINT and reset before exit
        process.on('SIGINT', function() {
            ws281x.reset();
            process.nextTick(function() {
            process.exit(0);
            });
        });

        this.setData(settings);

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

    addEffect(){
        let pattern = new Pattern(this.settings);
        this.effects.push( pattern );

        return pattern;
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

    deleteEffect(effectIndex){
        if( effectIndex >= 0 && effectIndex < this.effects.length ){
            let selectedEffect = this.currentEffectIndex;
            this.effects.splice(effectIndex,1);
            if(selectedEffect>=effectIndex)
                this.currentEffect = this.effects[--selectedEffect];
        }

    }

    getData(){
        return {
            effectIndex:this.currentEffectIndex,
            effects:this.effects.map((effect)=>effect.toJson())
        }
    }

    setData(settings){      
        if(settings.effects) this.effects = settings.effects.map((data)=>new Pattern(this.settings).fromJson(data)).filter((e)=>!!e);
        if(!this.effects || !this.effects.length){
          console.log("no effects found. Creating defaults");
          const offEffect = new Pattern(this.settings,"off","Plain");
        
          this.effects = [
            offEffect,
            new Pattern(this.settings,"white","Plain",new Color(0,0,0,1))
          ];
        }
        this.selectEffect( settings.effectIndex );

    }

    save(){
        this.settings.save(this.getData());
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