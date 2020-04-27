"use strict";

const Gpio = require('onoff').Gpio;

let movementSensor = function(callback){
    const sensorIn = new Gpio(22, 'in','both');
    const signal = new Gpio(27, 'out');

    signal.writeSync(1);
    sensorIn.watch(function(err,value){
        callback(value);
    });
    
    process.on('SIGINT', function () {
        sensorIn.unexport();
        signal.unexport();
    });
    
}

module.exports = movementSensor;