'use strict';

const ws281x = require('rpi-ws281x-native');

const STRIP_TYPE = "sk6812-grbw";

const Color = require('./Color');
const Plain = require('./effects/plain');
module.exports = class {

    constructor(settings,numLeds){

        const types = [
            Plain
          ];

        settings.load().then((e,data)=>{
            try {
              this.selectEffect( settings.effectIndex );
            }
            catch(e){
              console.warn("Error reading JSON settings file");
            }
          
        });

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
}