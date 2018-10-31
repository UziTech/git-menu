/** @babel */

/** @jsx etch.dom */

import etch from "etch";
import {CompositeDisposable} from "atom";

export default class Dialog {
	constructor(props = {}) {

		this.disposables = new CompositeDisposable();

		this.state = this.initialState(props);

		etch.initialize(this);

		this.disposables.add(atom.tooltips.add(this.refs.close, {
			title: "Close",
			keyBindingCommand: "core:cancel",
		}));
	}

	update(props) {
		if (props) {
			this.setState(props);
		}

		return etch.update(this);
	}

	destroy() {
		this.disposables.dispose();
		return etch.destroy(this);
	}

	setState(state) {
		this.state = Object.assign({}, this.state, state);
	}

	activate() {
		this.modalPanel = atom.workspace.addModalPanel({item: this});
		this.show();

		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	deactivate() {
		this.hide();
		this.modalPanel.destroy();
		this.destroy();
	}

	keyup(e) {
		switch (e.key) {
		case "Escape":
			this.cancel();
			break;
		default:
				// do nothing
		}
	}

	cancel() {
		this.reject();
		this.deactivate();
	}

	async accept() {
		const result = await this.validate(this.state);
		if (!Array.isArray(result)) {
			return;
		}
		this.resolve(result);
		this.deactivate();
	}

	render() {

		const title = this.title();
		const titleClass = title.toLowerCase()
			.replace(/\W/g, "-");

		return (
			<div className={`dialog git-menu ${titleClass}`} on={{keyup: this.keyup}}>
				<div className="heading">
					<i className="icon icon-x clickable" on={{click: this.cancel}} ref="close"></i>
					<h1 className="title">{title}</h1>
				</div>
				<div className="body">
					{this.body()}
				</div>
				<div className="buttons">
					{this.buttons()}
				</div>
			</div>
		);
	}

	initialState(props) {
		// Subclass can override this initialState() method
		return props;
	}

	// eslint-disable-next-line no-unused-vars
	validate(state) {
		throw new Error("Subclass must implement an validate(state) method");
	}

	title() {
		throw new Error("Subclass must implement a title() method");
	}

	body() {
		throw new Error("Subclass must implement a body() method");
	}

	buttons() {
		throw new Error("Subclass must implement a buttons() method");
	}

	show() {
		// Subclass can override this show() method
	}

	hide() {
		// Subclass can override this hide() method
	}

	beforeInitialize() {
		// Subclass can override this beforeInitialize() method
	}
}
