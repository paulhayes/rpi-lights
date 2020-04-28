'use strict';

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
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
          let effectId = lights.currentEffectId;
          let effects = {};
          Object.keys(lights.effects).forEach(k=>{effects[k]=lights.effects[k].name});
          
          res.json( { effects, selected:effectId } );
        });
        
        server.get('/effects/select/:effectId',(req,res)=>{
          let effectId = req.params.effectId;
          if(effectId){
            lights.selectEffect(effectId);
            if(req.header('Accept').split(',').indexOf('text/html')==0){
              res.statusCode = 303;
              res.header('Location','/');  
            }
            res.end( JSON.stringify({status:'okay'}) );
            lights.save();
          }
          else {
            res.statusCode = 400;
            res.json({error : "request missing required property"});
          }          
        });

        server.delete('/effects/:effectId',(req,res)=>{
          let effectId = req.params.effectId;
          if(lights.hasEffect(effectId)){
            lights.deleteEffect(effectId);
            res.json({'status':'ok'});
          }
          else {
            res.json({'status':'error','message':'out of range'});            
          }
        });
        
        server.post('/effects',function(req,res){
          let effectCreatedId = lights.addEffect();
          lights.selectEffect(effectCreatedId); 
          lights.save();
          return res.json({effectId:effectCreatedId});          
        });

        server.get('/effects/settings/:effectId',function(req,res){
          let effectId = req.params.effectId;
          if(!effectId){
            res.statusCode = 401;
            res.json("Missing property effectId");
            return;
          }
          lights.selectEffect(effectId);
          res.json(lights.effects[effectId].getProperties());  
      });

        server.put('/effects/settings/:effectId',function(req,res){
          let effectId = req.params.effectId;
          if(!effectId){
            res.statusCode = 401;
            res.json("Missing property effectId");
            return;
          }
          lights.effects[effectId].fromJson(req.body);
          //lights.setProperties(effectId,);
          res.json({status:"ok"});
          lights.save();
        });

        server.post('/effects/settings',function(req,res){
          lights.save();
           
        })
               
        if( fs.existsSync('ssl/server.key') ){
          console.log("starting https");
          const config = {
            key: fs.readFileSync('ssl/server.key','utf8'),
            cert: fs.readFileSync('ssl/server.cert','utf8'),
          };
          https.createServer(config,server).listen(443);
  
        }
        console.log("starting http");
        http.createServer(server).listen(80);
    }
      
}