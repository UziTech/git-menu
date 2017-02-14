"use babel";

import { CompositeDisposable } from "atom";
import { $, SelectListView } from "atom-space-pen-views";

export default class SelectView extends SelectListView {
	constructor(props) {

		this.disposables = new CompositeDisposable();

		this.onchange = _ => {};

		this.setState(props);
	}

	setState(props) {
		if (typeof props.value === "string" && props.value !== this.value) {
			this.value = props.value;
		}
		if (props.items) {
			this.setItems(props.items);
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

	viewForItem(item) {
		return $("<li/>").data({ value: item.value }).text(item.name);
	}

	confirmed(item) {
		this.onchange({ target: this });
	}

	getFilterKey() {
		return "name";
	}

	get value() {
		return this.getSelectedItem().data().value;
	}

	set value(value) {
		this.filterEditorView.setText(value);
	}
}
