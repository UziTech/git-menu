"use babel";

import { CompositeDisposable } from "atom";
import { TextEditorView } from "atom-space-pen-views";

export default class InputView extends TextEditorView {
	constructor(props) {
		super({
			mini: true,
			attributes: {
				tabindex: 0
			}
		});

		this.disposables = new CompositeDisposable();

		this.onchange = _ => {};

		this.disposables.add(this.getModel().getBuffer().onDidChange(_ => {
			this.onchange({ target: this });
		}));

		this.setState(props);

	}

	setState(props) {
		if (typeof props.value === "string" && props.value !== this.value) {
			this.value = props.value;
		}
		if (props.onchange) {
			this.onchange = props.onchange;
		}
	}

	update(props, children) {
		this.setState(props);
	}

	destroy() {
		this.disposables.dispose();
	}

	get value() {
		return this.getText();
	}

	set value(value) {
		this.setText(value);
	}
}
