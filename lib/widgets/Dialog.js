"use babel";
/** @jsx etch.dom */
/* globals atom */

import etch from "etch";

export default class Dialog {
	constructor(props = {}) {

		this.state = this.initialState(props);

		this.cancel = this.cancel.bind(this);
		this.keyup = this.keyup.bind(this);
		this.accept = this.accept.bind(this);

		this.beforeInitialize();
		etch.initialize(this);
	}

	update(props) {
		if (props) {
			this.setState(props);
		}

		return etch.update(this);
	}

	destroy() {
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

	accept() {
		const result = this.validate(this.state);
		if (!Array.isArray(result)) {
			return;
		}
		this.resolve(result);
		this.deactivate();
	}

	render() {
		return (
			<div className="dialog context-git" onkeyup={this.keyup}>
				<div className="heading">
					<i className="icon x clickable" onclick={this.cancel}></i>
					<strong>{this.title()}</strong>
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
