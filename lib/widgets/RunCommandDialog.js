"use babel";
/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";

export default class RunDialog extends Dialog {

	beforeInitialize() {
		this.commandChange = this.commandChange.bind(this);
		this.fileChange = this.fileChange.bind(this);
	}

	initialState(props) {
		let state = {
			files: props.files || [],
			command: "",
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
			this.refs.commandInput.classList.add("error");
		}
		if (error) {
			return;
		}

		const files = state.files.filter(file => file.selected).map(file => file.file);

		return [
			state.command,
			files,
		];
	}

	show() {
		this.refs.commandInput.focus();
	}

	commandChange(e) {
		this.refs.commandInput.classList.remove("error");
		this.update({command: e.target.value});
	}

	fileChange(idx) {
		return (e) => {
			const files = this.state.files.map((file, i) => {
				if (idx === i) {
					file.selected = e.target.checked;
				}
				return file;
			});
			this.update({files});
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
					<input type="text" ref="commandInput" tabIndex={this.state.files.length + 1} className="native-key-bindings input-text" value={this.state.command} oninput={this.commandChange}/>
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
