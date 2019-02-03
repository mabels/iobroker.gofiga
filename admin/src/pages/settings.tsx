import * as React from "react";

import { Tooltip } from "iobroker-react-components";
import { _ } from "../lib/adapter";

export type OnSettingsChangedCallback = (newSettings: ioBroker.AdapterConfig) => void;

interface SettingsProps {
	onChange: OnSettingsChangedCallback;
	settings: ioBroker.AdapterConfig;
}

interface LabelProps {
	for: string;
	text: string;
	class?: string[];
	tooltip?: string;
}

/** Helper component for a settings label */
function Label(props: LabelProps) {
	const classNames =
		(props.class as string[] || [])
		;
	return (
		<label htmlFor={props.for} className={classNames.join(" ")}>
			{_(props.text)}
			{props.tooltip != null && <Tooltip text={props.tooltip} />}
		</label>
	);
}

interface CheckboxLabelProps {
	text: string;
	class?: string[];
	tooltip?: string;
}

/** Inner label for a Materializes CSS checkbox (span, no for property) */
function CheckboxLabel(props: CheckboxLabelProps) {
	const classNames =
		(props.class as string[] || [])
		;
	return (
		<span className={classNames.join(" ")}>
			{_(props.text)}
			{props.tooltip != null && <Tooltip text={props.tooltip} />}
		</span>
	);
}

export class Settings extends React.Component<SettingsProps, ioBroker.AdapterConfig> {

	constructor(props: SettingsProps) {
		super(props);
		// settings are our state
		this.state = {
			...props.settings,
		};

	}

	// private chkPreserveTransitionTime: HTMLInputElement | null | undefined;

	private parseChangedSetting(target: HTMLInputElement | HTMLSelectElement): ioBroker.AdapterConfig[keyof ioBroker.AdapterConfig] {
		const newLocal = target.type === "checkbox" ? !((target as any).checked) :
			target.type === "number" ? parseInt(target.value, 10) : target.value;
		// Checkboxes in MaterializeCSS are messed up, so we attach our own handler
		// However that one gets called before the underlying checkbox is actually updated,
		// so we need to invert the checked value here
		return newLocal;
	}

	// gets called when the form elements are changed by the user
	private handleChange = (event: React.FormEvent<HTMLElement>) => {
		const target = event.target as (HTMLInputElement | HTMLSelectElement); // TODO: more types
		const value = this.parseChangedSetting(target);

		console.log("handleChange:", value, event);
		// store the setting
		this.putSetting(target.id as keyof ioBroker.AdapterConfig, value, () => {
			// and notify the admin UI about changes
			this.props.onChange(this.state);
		});

		return false;
	}

	/**
	 * Reads a setting from the state object and transforms the value into the correct format
	 * @param key The setting key to lookup
	 */
	private getSetting = <
		TKey extends keyof ioBroker.AdapterConfig,
		TSetting extends ioBroker.AdapterConfig[TKey] = ioBroker.AdapterConfig[TKey],
	>(key: TKey, defaultValue?: TSetting): TSetting | undefined => {
		console.log("getSetting:", this.state, key);
		const ret = this.state[key] as TSetting;
		return ret != undefined ? ret : defaultValue;
	}
	/**
	 * Saves a setting in the state object and transforms the value into the correct format
	 * @param key The setting key to store at
	 */
	private putSetting<
		TKey extends keyof ioBroker.AdapterConfig,
		TSetting extends ioBroker.AdapterConfig[TKey],
	>(key: TKey, value: TSetting, callback?: () => void): void {
		this.setState({ [key]: value } as unknown as Pick<ioBroker.AdapterConfig, TKey>, callback);
		console.log("putSetting:", this.state, key, value);
	}

	public componentWillUnmount() {
		// if (this.chkPreserveTransitionTime != null) {
		// 	$(this.chkPreserveTransitionTime).off("click", this.handleChange as any);
		// }
	}

	public componentDidMount() {
		// update floating labels in materialize design
		M.updateTextFields();
		// Fix materialize checkboxes
		// if (this.chkPreserveTransitionTime != null) {
		// 	$(this.chkPreserveTransitionTime).on("click", this.handleChange as any);
		// }
	}

	public render() {
		return (
			<>
				<div className="row">
					<div className="col s4 input-field">
						<input type="text" className="value" id="firebaseUrl" value={this.getSetting("firebaseUrl")} onChange={this.handleChange} />
						<Label for="firebaseUrl" text="FireBase-Url:" tooltip="firebaseUrl tooltip" />
					</div>
					<div className="col s4 input-field">
						<input type="text" className="value" id="oauthToken" value={this.getSetting("oauthToken")} onChange={this.handleChange} />
						<Label for="oauthToken" text="OAuth-Token:" tooltip="oauthToken tooltip" />
					</div>
				</div>
			</>
		);
	}

}
