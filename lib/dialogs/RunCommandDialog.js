/** @babel */

/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";
import Autocomplete from "../widgets/Autocomplete.js";
import FileTree from "../widgets/FileTree.js";

const RECENT_ITEM_KEY = "git-menu-run-command-recent";

export default class RunCommandDialog extends Dialog {

	getRecentItems() {
		let recentItems = [];
		try {
			recentItems = JSON.parse(localStorage.getItem(RECENT_ITEM_KEY));
		} catch (ex) {
			// invalid json
		}

		if (!Array.isArray(recentItems)) {
			recentItems = [];
		}

		return recentItems;
	}

	addRecentItem(item) {
		let recentItems = this.getRecentItems();

		// remove item from list
		recentItems = recentItems.filter(recentItem => recentItem !== item);

		// add item to the top of the list
		recentItems.unshift(item);

		// maximum 100 items to prevent bloat
		recentItems.splice(100);

		try {
			localStorage.setItem(RECENT_ITEM_KEY, JSON.stringify(recentItems));
		} catch (ex) {
			// invalid json
		}
	}

	removeRecentItem(item) {
		let recentItems = this.getRecentItems();
		recentItems = recentItems.filter(recentItem => recentItem !== item);

		try {
			localStorage.setItem(RECENT_ITEM_KEY, JSON.stringify(recentItems));
		} catch (ex) {
			// invalid json
		}
	}

	initialState(props) {
		const state = {
			files: props.files || [],
			command: "",
			recentItems: this.getRecentItems(),
			treeView: props.treeView,
		};

		this.commandRemoveItem = this.commandRemoveItem.bind(this);
		this.commandChange = this.commandChange.bind(this);

		return state;
	}

	validate(state) {
		let error = false;
		if (!state.command) {
			error = true;
			this.refs.commandInput.refs.input.classList.add("error");
		}
		if (error) {
			return;
		}

		const files = this.refs.fileTree.getSelectedFiles();

		this.addRecentItem(state.command);

		return [
			state.command,
			files,
		];
	}

	show() {
		this.refs.commandInput.focus();
	}

	commandChange(e, value) {
		this.refs.commandInput.refs.input.classList.remove("error");
		this.update({command: value});
	}

	commandRemoveItem(value, item) {
		this.removeRecentItem(item);
		this.update({recentItems: this.getRecentItems(), command: value});
	}

	body() {

		return (
			<div>
				<FileTree ref="fileTree" files={this.state.files} tabIndexStart="1" treeView={this.state.treeView} />
				<label className="input-label">
					Command (use '%files%' to add the selected files to the command)
					<Autocomplete items={this.state.recentItems} removeButton="true" onRemove={this.commandRemoveItem} maxItems="10" ref="commandInput" tabIndex={ this.state.files.length + 1 } value={this.state.command} onChange={this.commandChange} />
				</label>
			</div>
		);
	}

	title() {
		return "Run Command";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-dashboard inline-block-tight" tabIndex={this.state.files.length + 2} on={{click: this.accept}}>
					Run
				</button>
			</div>
		);
	}
}
