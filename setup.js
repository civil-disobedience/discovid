'use strict';
import { discoverGateway, TradfriClient /*, more imports */ } from "node-tradfri-client";
import log from "signale"; 
const securityCode = process.argv.slice(2)[0];
if (!securityCode) {
  log.fatal("missing securityCode param. Usage init.js YOUR_SECURITY_CODE (16 digits at the back)");
  process.exit(1);
}
(async() => {
try {
  const gw = await discoverGateway();
  log.info(gw);
 // const tradfri = new TradfriClient(gw.name);
  const tradfri = new TradfriClient(gw.addresses[0]);
  try {
    const {identity, psk} = await tradfri.authenticate(securityCode);
    log.success("id and psk",identity,psk);
  } catch (e) {
    log.fatal(e);
  }
//  process.exit(1);
    // store identity and psk
} catch (e) {
    // handle error
}
})();
