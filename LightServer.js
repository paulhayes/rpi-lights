'use strict';

const http = require('http');
const express = require('express');
const url = require('url');


module.exports = class {
    constructor(settings,lights){
        const server = this.server = express();
        server.use(express.static('public'));
        server.get('/options',this.returnOptions.bind(this));
        
        server.get('/select',this.parseOption.bind(this));
        
        server.put('/effect/add',function(res,req){
        
        });
        
        server.get('/effect_types',function(res,req){
        
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
        let obj = url.parse(req.url,true).query;
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify({status:'okay'}) );
        
        if( 'option' in obj ){
            let effectIndex = parseInt(obj.option,10);
            this.lights.selectEffect(effectIndex);            
            this.settings.save(JSON.stringify(lights.getData()));           
        }
    }
      
      getEffectConfig(effectIndex){
      
      }
      
      setEffectConfig(effectIndex,configStr){
      
      }
      
      listEffectTypes(res){
        
      }
      
}