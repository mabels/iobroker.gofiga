// tslint:disable:object-literal-key-quotes

// actually load them now

// Eigene Module laden
// import { composeObject, entries, values } from "alcalzone-shared/objects";
// import { ExtendedAdapter, Global as _ } from "./lib/global";

// Datentypen laden

// Adapter-Utils laden
import * as utils from "@iobroker/adapter-core";

// Adapter-Module laden
// import { ensureInstanceObjects, fixAdapterObjects } from "./lib/fix-objects";
// import { getInstanceId } from "./lib/iobroker-objects";
// import { subscribeStates } from "./modules/custom-subscriptions";
// import { renameDevice, renameGroup } from "./modules/operations";

// import { session as $ } from "./modules/session";

let connectionAlive: boolean;
let adapter: ioBroker.Adapter;

function startAdapter(options: Partial<ioBroker.AdapterOptions> = {}) {
	const _ = adapter = utils.adapter({
		// Default options
		...options,
		// custom options
		name: "gofiga",

		// Wird aufgerufen, wenn Adapter initialisiert wird
		ready: async () => {

			// _.log.info("gofiga: ready-1");
			// Adapter-Instanz global machen
			// adapter = _.extend(adapter);
			// ObjectsObjectObjectss_.adapter = adapter;

			// Fix our adapter objects to repair incompatibilities between versions
			// await ensureInstanceObjects();
			// await fixAdapterObjects();

			// we're not connected yet!
			await adapter.setStateAsync("info.connection", false, true);

			// Sicherstellen, dass die Optionen vollständig ausgefüllt sind.
			if (adapter.config
				&& adapter.config.oauthToken != null && adapter.config.oauthToken !== ""
				&& adapter.config.firebaseUrl != null && adapter.config.firebaseUrl !== ""
			) {
				// alles gut
				_.log.info(`Configuration Completed ${adapter.config.oauthToken} ${adapter.config.firebaseUrl}`);
			} else {
				adapter.log.error("Please set the connection params in the adapter options before starting the adapter!");
				return;
			}
			// redirect console output
			// console.log = (msg) => adapter.log.debug("STDOUT > " + msg);
			// console.error = (msg) => adapter.log.error("STDERR > " + msg);
	//   _.log.info(`startfile = ${process.argv}`, "error");

			// watch own states
	  _.log.info("Subscribe *");

	  adapter.on("objectChange", (id, obj) => {
		_.log.info(`objectChange ${id}:${JSON.stringify(obj)}`);
	  });
	  adapter.on("stateChange", (id, obj) => {
		_.log.info(`stateChange ${id}:${JSON.stringify(obj)}`);
	  });
	  adapter.on("message", (id) => {
		_.log.info(`message ${id}`);
	  });

	//   let m = 0;
	//   setInterval(async () => {
	// 	_.log.info(`message ${++m}`);
	// 	adapter.setState("info.now", m + 	":" + (new Date()).toISOString());

	//   }, 5000);

	/*
	  adapter.subscribeStates(`*`, "", (...args) => {
		_.log.info(`ErrorStates:${args}`, "error");
	});
	  adapter.subscribeObjects(`*`, "", (...args) => {
		_.log.info(`ErrorObjects:${args}`, "error");
	});
	*/
	  adapter.subscribeForeignStates("*", "", (...args) => {
		_.log.info(`ErrorForeignStates:${args}`);
	});
	//   adapter.subscribeForeignStates("ping.0.2guns.8_8_8_8");
	//   adapter.subscribeForeignObjects("ping.0.2guns.8_8_8_8");
	  adapter.subscribeForeignObjects("*", "", (...args) => {
		  _.log.info(`ErrorForeignObjects:${args}`);
	  });

	  _.log.info(`setObject: info.now`);
	  await adapter.setObjectAsync("info.now", {
		type: "state",
		common: {
			name: "now",
				role: "value",
				type: "string",
				read: true,
				write: true,
		},
		native: {
		},
	  });
			// add special watch for lightbulb states, so we can later sync the group states

			// Auth-Parameter laden
			// const hostname = adapter.config.host.toLowerCase();
	  const firebaseUrl = adapter.config.firebaseUrl;
	//   const oauthToken = adapter.config.oauthToken;

			// $.tradfri = new TradfriClient(hostname, {
			// 	customLogger: _.log,
			// 	watchConnection: true,
			// });

	  if (firebaseUrl != null && firebaseUrl.length > 0) {
				// we temporarily stored the security code to replace it with identity/psk
				try {
					// ({ identity, psk } = await $.tradfri.authenticate(securityCode));
					// store it and restart the adapter
					_.log.info(`${firebaseUrl} The authentication was successful. The adapter should now restart. If not, please restart it manually.`);
					// await updateConfig({
					// 	oauthToken,
					// 	firebaseUrl,
					// });
				} catch (e) {
					_.log.info(`Error:${e}`);
					return;
				}
			} else {
				// connect with previously negotiated identity and psk
				try {
					// await $.tradfri.connect(identity!, psk!);
					_.log.info(`The authentication was successful. The adapter should now restart. If not, please restart it manually.`);
				} catch (e) {
					_.log.info(`Error:${e}`);
					return;
				}
			}

			// watch the connection
	  await adapter.setStateAsync("info.connection", true, true);
	  connectionAlive = true;

		},

		// Handle sendTo-Messages
		message: (...args) => {
			_.log.info(`message:${args}`);
		},

		objectChange: (id, obj) => {
			_.log.info(`{{blue}} object with id ${id} ${obj ? "updated" : "deleted"}`);

			// if (id.startsWith(adapter.namespace)) {
			// 	// this is our own object.

			// 	if (obj) {
			// 		// first check if we have to modify a device/group/whatever
			// 		const instanceId = getInstanceId(id);
			// 		if (instanceId == undefined) return;

			// 		if (obj.type === "device" && instanceId in $.devices && $.devices[instanceId] != null) {
			// 			// if this device is in the device list, check for changed properties
			// 			const acc = $.devices[instanceId];
			// 			if (obj.common && obj.common.name !== acc.name) {
			// 				// the name has changed, notify the gateway
			// 				_.log.info(`the device ${id} was renamed to "${obj.common.name}"`);
			// 				renameDevice(acc, obj.common.name);
			// 			}
			// 		} else if (obj.type === "channel" && instanceId in $.groups && $.groups[instanceId] != null) {
			// 			// if this group is in the groups list, check for changed properties
			// 			const grp = $.groups[instanceId].group;
			// 			if (obj.common && obj.common.name !== grp.name) {
			// 				// the name has changed, notify the gateway
			// 				_.log.info(`the group ${id} was renamed to "${obj.common.name}"`);
			// 				renameGroup(grp, obj.common.name);
			// 			}
			// 		}
			// 		// remember the object
			// 		$.objects[id] = obj;
			// 	} else {
			// 		// object deleted, forget it
			// 		if (id in $.objects) delete $.objects[id];
			// 	}

			// }

			// apply additional subscriptions we've defined
	//   applyCustomObjectSubscriptions(id, obj);

		},

		stateChange: async (id, state) => {
			if (state) {
				_.log.info(`{{blue}} state with id ${id} updated: ack = ${state.ack} val = ${state.val}`);
			} else {
				_.log.info(`; {{blue; }} state; with id $; {id; } deleted`);
			}

			if (!connectionAlive && state && !state.ack && id.startsWith(adapter.namespace)) {
				_.log.info("Not connected to the gateway. Cannot send changes!");
				return;
			}

			// apply additional subscriptions we've defined
			// applyCustomStateSubscriptions(id, state);
		},

		unload: (callback) => {
	  // _.log.info(`unlock`, "error");
			// is called when adapter shuts down - callback has to be called under any circumstances!
			try {
				// close the gateway connection
				// $.tradfri.destroy();
				adapter.setState("info.connection", false, true);

				callback();
			} catch (e) {
				callback();
			}
		},
	});
	return adapter;
}

// async function updateConfig(newConfig: Partial<ioBroker.AdapterConfig>) {
// 	// Create the config object
// 	const config: ioBroker.AdapterConfig = {
// 		...adapter.config,
// 		...newConfig,
// 	};
// 	// Update the adapter object
// 	const adapterObj = await adapter.getForeignObjectAsync(`system.adapter.${adapter.namespace}`);
// 	adapterObj.native = config;
// 	await adapter.setForeignObjectAsync(`system.adapter.${adapter.namespace}`, adapterObj);
// }

// ==================================
// manage devices

function getMessage(err: Error | string): string {
	// Irgendwo gibt es wohl einen Fehler ohne Message
	if (err == null) return "undefined";
	if (typeof err === "string") return err;
	if (err.message != null) return err.message;
	if (err.name != null) return err.name;
	return err.toString();
}

function onUnhandledRejection(err: Error) {
	adapter.log.error("unhandled promise rejection: " + getMessage(err));
	if (err.stack != null) adapter.log.error("> stack: " + err.stack);
}

function onUnhandledError(err: Error) {
	adapter.log.error("unhandled exception:" + getMessage(err));
	if (err.stack != null) adapter.log.error("> stack: " + err.stack);
	terminate(1, "unhandled exception");
}

function terminate(exitCode?: number, reason?: string) {
	if (adapter && typeof adapter.terminate === "function") {
		adapter.terminate(reason);
	} else {
		process.exit(exitCode);
	}
}

// Trace unhandled errors
process.on("unhandledRejection", onUnhandledRejection);
process.on("uncaughtException", onUnhandledError);

// try loading tradfri module to catch potential errors

if (module.parent) {
	// Export startAdapter in compact mode
	module.exports = startAdapter;
} else {
	startAdapter();
}
