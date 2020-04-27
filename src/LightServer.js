'use strict';

const express = require('express');
const { getParamInt } = require('../src/http-utils');

module.exports = class {
    constructor(settings,lights){
        this.lights = lights;
        this.settings = settings;

        const server = this.server = express();
        server.use(express.static('./public'));
        server.use(express.json())
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

        server.delete('/effects/:effectIndex',(req,res)=>{
          let effectIndex = getParamInt(req.params,"effectIndex");
          if(effectIndex>=0 && effectIndex<lights.effects.length){
            lights.deleteEffect(effectIndex);
            res.json({'status':'ok'});
          }
          else {
            res.json({'status':'error','message':'out of range'});            
          }
        });
        
        server.post('/effects',function(req,res){
          let effectCreated = lights.addEffect();
          lights.selectEffect(lights.effects.length-1); 
          lights.save();
          return res.json({effectIndex:lights.currentEffectIndex});          
        });

        server.get('/effects/settings/:effectIndex',function(req,res){
          let effectIndex = getParamInt(req.params,"effectIndex");
          if(effectIndex===false){
            res.statusCode = 401;
            res.json("Missing property effectIndex");
            return;
          }
          lights.selectEffect(effectIndex);
          res.json(lights.effects[effectIndex].getProperties());  
      });

        server.put('/effects/settings/:effectIndex',function(req,res){
          let effectIndex = getParamInt(req.params,"effectIndex");
          if(effectIndex===false){
            res.statusCode = 401;
            res.json("Missing property effectIndex");
            return;
          }
          lights.effects[effectIndex].fromJson(req.body);
          //lights.setProperties(effectIndex,);
          res.json({status:"ok"});
          lights.save();
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