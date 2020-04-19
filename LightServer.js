'use strict';

const http = require('http');
const express = require('express');
const url = require('url');
const Effects = require('./effects/Effects');


module.exports = class {
    constructor(settings,lights){
        const server = this.server = express();
        server.use(express.static('public'));
        server.get('/options',this.returnOptions.bind(this));
        
        server.get('/select',this.parseOption.bind(this));
        
        server.put('/effect/add',function(req,res){
        
        });
        
        server.get('/effect_types',function(req,res){
          res.json(Object.keys(Effects.types));
          //res.json(Object.fromEntries(Object.entries(Effects.types).map(([n,et])=>[et.getDescription(),et.getProperties()])));
        });

        server.get('/effect_settings',function(req,res){
          let queryObj = url.parse(req.url,true).query;
          if('effect' in queryObj){
            let effectIndex = parseInt(queryObj.effect,10);
            console.log(lights.effects[effectIndex]);
            res.json(lights.effects[effectIndex].getProperties());
          }
        });
               
        server.listen(80);

        this.lights = lights;
        this.settings = settings;
    }

    returnOptions(req,res){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        let currentIndex = Math.max(0, this.lights.currentEffectIndex);
        res.end( JSON.stringify({ effects:this.lights.effects.map(e=>e.name), selected:currentIndex }));
      }
      
    parseOption(req,res){
        let queryObj = url.parse(req.url,true).query;
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify({status:'okay'}) );
        
        if( 'option' in queryObj ){
            let effectIndex = parseInt(queryObj.option,10);
            this.lights.selectEffect(effectIndex);            
            this.settings.save(JSON.stringify(this.lights.getData()));           
        }
    }
      
      getEffectConfig(effectIndex){
      
      }
      
      setEffectConfig(effectIndex,configStr){
      
      }
      
      listEffectTypes(res){
        
      }
      
}