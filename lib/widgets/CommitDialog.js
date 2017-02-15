"use babel";
/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";

export default class CommitDialog extends Dialog {

	beforeInitialize() {
		this.messageChange = this.messageChange.bind(this);
		this.amendChange = this.amendChange.bind(this);
		this.pushClick = this.pushClick.bind(this);
		this.pushPullClick = this.pushPullClick.bind(this);
		this.fileChange = this.fileChange.bind(this);
	}

	initialState(props) {
		let state = {
			files: props.files || [],
			message: "",
			lastCommit: props.lastCommit || "",
			amend: false,
			push: false,
			pull: false,
		};
		state.files = state.files.map(file => {
			file.selected = true;
			return file;
		});
		return state;
	}

	validate(state) {
		let error = false;
		if (!state.message) {
			error = true;
			this.refs.messageInput.classList.add("error");
		}
		if (error) {
			return;
		}

		const files = state.files.filter(file => file.selected).map(file => file.file);

		return [
			state.message,
			state.amend,
			state.push,
			state.pull,
			files,
		];
	}

	show() {
		this.refs.messageInput.focus();
	}

	messageChange(e) {
		this.refs.messageInput.classList.remove("error");
		this.update({message: e.target.value});
	}

	amendChange(e) {
		let message = this.state.message;
		const amend = e.target.checked;
		if (!message && amend) {
			message = this.state.lastCommit;
		} else if (message === this.state.lastCommit && !amend) {
			message = "";
		}
		this.update({message, amend});
	}

	pushClick(e) {
		this.update({push: true});
		this.accept();
	}

	pushPullClick(e) {
		this.update({push: true, pull: true,});
		this.accept();
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
					<label>
						<input type="checkbox" tabIndex={idx + 1} checked={file.selected} onchange={this.fileChange(idx)}/>
						<span>{file.file}</span>
					</label>
				</div>
			);
		});

		const messageTooLong = this.state.message.split("\n").some((line, idx) => ((idx === 0 && line.length > 50) || line.length > 80));
		const lastCommitLines = this.state.lastCommit !== null ? this.state.lastCommit.split("\n") : null;
		const firstLineOfLastCommit = lastCommitLines !== null ? lastCommitLines[0] + (lastCommitLines.length > 1 ? "..." : "") : null;

		return (
			<div>
				<div className="files" ref="files">
					{files}
				</div>
				<label>
					Message
					<textarea ref="messageInput" tabIndex={this.state.files.length + 1} className={(messageTooLong ? "too-long " : "") + "message native-key-bindings"} oninput={this.messageChange} value={this.state.message}/>
				</label>
				<label>
					<input type="checkbox" tabIndex={this.state.files.length + 2} checked={this.state.amend} onchange={this.amendChange} disabled={this.state.lastCommit === null}/>
					Amend Last Commit: <span className="last-commit">{firstLineOfLastCommit !== null ? firstLineOfLastCommit : ""}</span>
				</label>
			</div>
		);
	}

	title() {
		return "Commit";
	}

	buttons() {
		return (
			<div>
				<button className="btn inline-block-tight" tabIndex={this.state.files.length + 3} onclick={this.accept}>
					<i className="icon commit"></i>
					<span>Commit</span>
				</button>
				<button className="btn inline-block-tight" tabIndex={this.state.files.length + 4} onclick={this.pushClick}>
					<i className="icon push"></i>
					<span>Commit & Push</span>
				</button>
				<button className="btn inline-block-tight" tabIndex={this.state.files.length + 5} onclick={this.pushPullClick}>
					<i className="icon pull"></i>
					<span>Commit & Push & Pull</span>
				</button>
			</div>
		);
	}
}
