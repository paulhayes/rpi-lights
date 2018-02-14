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

**Power per meter for 144 density strips*

### Setting up Raspberry Pi

Create an SD card with the latest raspbian image.

- Add an empty file call ```ssh``` to the boot partition
- Add a ```wpa_supplicant.conf``` to boot partition.
- change default user password: ```passwd```
- Create lights user: ```adduser lights```
- Add lights user to sudoers group: ```sudo usermod -aG sudo <username>```
- Copy your rsa public key file: ```ssh-copy-id pi@raspberrypi.local``` 
- Install git: ```apt-get install git```
- Install node js, instructions here: https://github.com/sdesalas/node-pi-zero
- Clone this repo: ```git clone git@github.com:paulhayes/rpi-lights.git```
- Copy config.txt to boot ```cp config.txt /boot/config.txt```

### Setup

Modify the /etc/hostname to something ending with lights.
```
office-lights
```

The mDns service should then find the lights by searching ```_lights._tcp.local```

### Config

### Startup on Boot
Add the following line before ```exit(0)``` in ```/etc/rc.local```

```bash
node /home/lights/workspace/rpi-lights/lights.js < /dev/null &
```

### Make read only
- Use the following instructions https://github.com/ways/rpi-readonly

