# Raspberry Pi Lights
Control of NeoPixel like strip from web browser.

### Hardware

* Raspberry Pi Zero W
* sk6812 with white and RGB LEDs
* Some serious 5v power supplies

### LEDS
I used 144 per meter density LEDs. Although any density will work. 


| Situation | Current | Power |
|-----------|---------|--------|
| The raspberry pi with lights off | 260mA | 1.3W |
| Full white LED per meter | 2440ma | 13.5W |
| Half white LED per meter | 1440ma | 7.2W |
| Full Red per meter | 1220ma | 6.1W |
| Full Green per meter | 1220ma | 6.1W |
| Full Blue per meter | 1230ma | 6.15W |




### Setup

Modify the /etc/hostname to something ending with lights.
```
office-lights
```

The mDns service should then find the lights by search for *-lights.local

### Config


### Startup on Boot
Add the following line before ```exit(0)``` in ```/etc/rc.local```

```bash
node /home/pi/workspace/lights/lights.js < /dev/null &
```
