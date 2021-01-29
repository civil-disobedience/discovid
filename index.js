"use strict";
import {
  discoverGateway,
  TradfriClient,
  AccessoryTypes,
} from "node-tradfri-client";
import dotenv from "dotenv";
import log from "signale";
import tty from "tty";
const config = dotenv.config().parsed;
const lightbulbs = {};

let tradfri = null;

process.on("SIGINT", function () {
  log.fatal("Caught interrupt signal");
  tradfri.destroy();
  process.exit();
});

const stdin = process.openStdin();
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding("utf8");

stdin.on("data", async key => {
  // ctrl-c ( end of text )
  switch (key) {
    case "\u0003":
      log.fatal("good bye");
    process.exit();
    break;
    case " ":
      log.success("change intensity");
      Object.values(lightbulbs).map (async device => {
       // [device.instanceId]) {
          // new light
          const light = device.lightList[0];
        console.log(light.dimmer);
        light.toggle();
        log.info("dim");
            //await light.setBrightness(1, 0.01);
          
      });
    break;
    default:
  // write the key to stdout all normal like
  log.info(key);
  }
});


(async () => {
  const gw = await discoverGateway();
  // const tradfri = new TradfriClient(gw.name);
  tradfri = new TradfriClient(gw.addresses[0]);
  //const tradfri = new TradfriClient(config.gateway);
  try {
    await tradfri.connect(config.identity, config.psk);
    tradfri
      .on("device updated", tradfri_deviceUpdated)
      .on("device removed", tradfri_deviceRemoved)
      .observeDevices();
  } catch (e) {
    log.fatal(e);
    // handle error - see below for details
  }

  async function tradfri_deviceUpdated(device) {
    switch (device.type) {
      case AccessoryTypes.lightbulb:
        // remember it
        if (!lightbulbs[device.instanceId]) {
          // new light
          lightbulbs[device.instanceId] = device;
          info(device);
          const light = device.lightList[0];
          switchOn(light);
          while (1) {
            await color(light);
            await wait(2);
          }
        } else {
          info(device);
          lightbulbs[device.instanceId] = device;
          //          log.debug("changed");
        }
        break;
      case AccessoryTypes.remote:
        console.log(device);
        log.info("remove", device);
        const success = await tradfri.observeResource(
          //fuck, the remote doesn't talk to the gateway ;(
          "15001/" + device.instanceId,
          (resp) => {
            log.success("called", resp);
          }
        );

        break;
      default:
        console.log(device);
    }
  }

  function tradfri_deviceRemoved(id) {
    log.warn(id);
    // clean up
  }

})();

  function info(device) {
    const light = device.lightList[0];
    log.info(
      "bulb",
      device.instanceId,
      device.deviceInfo.modelNumber,
      light.onOff,
      light.dimmer,
      light.color
    );
  }

  async function wait(duration) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, duration * 1000);
    });
  }
  async function color(light) {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const transition = 0.1;
    light.setColor(randomColor, transition);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, transition * 1000 + 10);
    });
  }

  function switchOn(light) {
    light.turnOn();
    light.setBrightness(254);
  }

  function blink(device) {
    //const light = lightbulbs[id].lightList[0];
    const light = device.lightList[0];
    //  console.log(light);
    // blink
    //light.toggle();
    light.turnOn();
    setTimeout(() => light.toggle(), 0);
    setTimeout(() => light.toggle(), 1000);
    setTimeout(() => light.toggle(), 2000);
    setTimeout(() => light.toggle(), 3000);
  }

