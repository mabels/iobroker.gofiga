// root objects
import * as React from "react";
import * as ReactDOM from "react-dom";

import { $window, _, instance, sendTo, socket} from "./lib/adapter";

// components
import { Tabs } from "iobroker-react-components";
import { OnSettingsChangedCallback, Settings } from "./pages/settings";

const namespace = `tradfri.${instance}`;

// layout components
interface RootProps {
	settings: ioBroker.AdapterConfig;
	onSettingsChanged: OnSettingsChangedCallback;
}

// tslint:disable-next-line:no-empty-interface
interface RootState {
	/* */
}

// TODO: Remove `any`
export class Root extends React.Component<RootProps, RootState> {

	constructor(props: RootProps) {
		super(props);
	}

	public render() {
		return (
			<Tabs labels={["Settings"]}>
				<Settings settings={this.props.settings} onChange={this.props.onSettingsChanged} />
				<></>
			</Tabs>
		);
	}

}

let curSettings: ioBroker.AdapterConfig;
let originalSettings: ioBroker.AdapterConfig;

/**
 * Checks if any setting was changed
 */
function hasChanges(): boolean {
	if (Object.keys(originalSettings).length !== Object.keys(curSettings).length) return true;
	for (const key of Object.keys(originalSettings) as (keyof ioBroker.AdapterConfig)[]) {
		if (originalSettings[key] !== curSettings[key]) return true;
	}
	return false;
}

// the function loadSettings has to exist ...
$window.load = (settings, onChange) => {

	originalSettings = settings;

	const settingsChanged: OnSettingsChangedCallback = (newSettings) => {
		curSettings = newSettings;
		onChange(hasChanges());
	};

	ReactDOM.render(
		<Root settings={settings} onSettingsChanged={settingsChanged} />,
		document.getElementById("gofiga-adapter-container") || document.getElementsByClassName("gofiga-adapter-container")[0],
	);

	// Signal to admin, that no changes yet
	onChange(false);
};

// ... and the function save has to exist.
// you have to make sure the callback is called with the settings object as first param!
$window.save = (callback) => {
	// save the settings
	callback(curSettings);
	originalSettings = curSettings;
};
