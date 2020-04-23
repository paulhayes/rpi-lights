'use strict';

const express = require('express');
const { getParamInt } = require('../src/http-utils');

module.exports = class {
    constructor(settings,lights){
        this.lights = lights;
        this.settings = settings;

        const server = this.server = express();
        server.use(express.static('./public'));

        server.get('/effects',(req,res)=>{
          res.statusCode = 200;
          let effectIndex = Math.max(0, lights.currentEffectIndex);
          res.json( { effects:lights.effects.map(e=>e.name), selected:effectIndex } );
        });
        
        server.get('/effects/select/:effectIndex',(req,res)=>{
          let effectIndex = getParamInt(req.params,"effectIndex");
          if(effectIndex!==false){
            lights.selectEffect(effectIndex);
            res.end( JSON.stringify({status:'okay'}) );
            lights.save();
          }
          else {
            res.statusCode = 400;
            res.json({error : "request missing required property"});
          }          
        });
        
        server.put('/effects/add',function(req,res){
          let effectCreated = lights.addEffect();
          lights.selectEffect(lights.effects.length-1); 
          lights.save();
          return res.json({effectIndex:lights.currentEffectIndex});          
        });
        
        /*
        server.get('/effect_types',function(req,res){
          res.json(Object.keys(Effects.types));
        });
        */

        server.get('/effects/settings/:effectIndex',function(req,res){
          let effectIndex = getParamInt(req.params,"effectIndex");
          lights.selectEffect(effectIndex);            
            
          res.json(lights.effects[effectIndex].getProperties());
        });

        server.post('/effects/settings',function(req,res){
          lights.save();
           
        })
               
        server.listen(80);

       
    }

    listEffects(req,res){
      
    }
      

      
      getEffectConfig(effectIndex){
      
      }
      
      setEffectConfig(effectIndex,configStr){
      
      }
      
      listEffectTypes(res){
        
      }
      
}