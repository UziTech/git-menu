"use babel";
/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";
import Autocomplete from "../widgets/Autocomplete.js";

const RECENT_ITEM_KEY = "context-git-run-command-recent";

export default class RunCommandDialog extends Dialog {

	beforeInitialize() {
		this.commandChange = this.commandChange.bind(this);
		this.commandRemoveItem = this.commandRemoveItem.bind(this);
		this.fileChange = this.fileChange.bind(this);
	}

	getRecentItems() {
		let recentItems = [];
		try {
			recentItems = JSON.parse(localStorage.getItem(RECENT_ITEM_KEY));
		} catch (ex) {}

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
		} catch (ex) {}
	}

	removeRecentItem(item) {
		let recentItems = this.getRecentItems();
		recentItems = recentItems.filter(recentItem => recentItem !== item);

		try {
			localStorage.setItem(RECENT_ITEM_KEY, JSON.stringify(recentItems));
		} catch (ex) {}
	}

	initialState(props) {
		let state = {
			files: props.files || [],
			command: "",
			recentItems: this.getRecentItems(),
		};
		state.files = state.files.map(file => {
			file.selected = true;
			return file;
		});
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

		const files = state.files.filter(file => file.selected)
			.map(file => file.file);

		this.addRecentItem(state.command);

		return [
			state.command,
			files,
		];
	}

	show() {
		this.refs.commandInput.focus();
	}

	commandChange(e) {
		this.refs.commandInput.refs.input.classList.remove("error");
		this.update({ command: e.target.value });
	}

	commandRemoveItem(value, item) {
		this.removeRecentItem(item);
		this.update({ recentItems: this.getRecentItems(), command: value });
	}

	fileChange(idx) {
		return (e) => {
			const files = this.state.files.map((file, i) => {
				if (idx === i) {
					file.selected = e.target.checked;
				}
				return file;
			});
			this.update({ files });
		};
	}

	body() {

		const files = this.state.files.map((file, idx) => {
			let classes = ["file"];
			if (file.added) {
				classes.push("added");
			}
			if (file.untracked) {
				classes.push("untracked");
			}
			if (file.deleted) {
				classes.push("deleted");
			}
			if (file.changed) {
				classes.push("changed");
			}
			return (
				<div className={classes.join(" ")}>
					<label className="input-label">
						<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={idx + 1} checked={file.selected} onchange={this.fileChange(idx)}/>
						{file.file}
					</label>
				</div>
			);
		});

		return (
			<div>
				<div className="files" ref="files">
					{files}
				</div>
				<label className="input-label">
					Command (use '%files%' to add the selected files to the command)
					<Autocomplete items={this.state.recentItems} removeButton="true" onRemove={this.commandRemoveItem} maxItems="10"  ref="commandInput" tabIndex={ this.state.files.length + 1 } value={this.state.command} onChange={this.commandChange} />
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
				<button className="native-key-bindings btn icon icon-dashboard inline-block-tight" tabIndex={this.state.files.length + 2} onclick={this.accept}>
					Run
				</button>
			</div>
		);
	}
}
