# Raspberry Pi Lights
Control of NeoPixel like strip from web browser and mobile app.

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

### Wiring

Raspberry PI
* Pin 2 - 5v 
* Pin 6 - Ground
* Pin 11 - Switch ( connect to GND )
* Pin 12 - sk6812-grbw LEDs

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
- Install Avahi: ```sudo apt-get install avahi```
- Copy service file: ```cp lights.service /etc/avahi/services/lights.service```

### Setup

Modify the /etc/hostname to something ending with lights.
```
office-lights
```

The mDns service should then find the lights by searching ```_lights._tcp.local```

### Config

### Startup on Boot

#### Option 1 rc.local

Add the following line before ```exit(0)``` in ```/etc/rc.local```

```bash
node /home/lights/workspace/rpi-lights/lights.js < /dev/null &
```

#### Option 2

Install and configure pm2

```bash
npm install -g pm2
pm2 start /home/lights/workspace/rpi-lights/lights.js
pm2 save
```


### Make read only
- Use the following instructions https://github.com/ways/rpi-readonly

### Modify code / Make Changes

- stop the exisiting service ```sudo killall node```
- switch to read-write mode ```rw```
- from the rpi-lights dir run: ```npm run dev```

This will create a autoretarting service, if code is changes the service will reboot.
