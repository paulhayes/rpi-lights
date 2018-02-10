"use strict";

const Gpio = require('onoff').Gpio;

const pwrLed = new Gpio(3, 'out');
const actLed = new Gpio(2, 'in','rising');