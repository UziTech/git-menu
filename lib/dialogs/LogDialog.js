/** @babel */

/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";
import gitCmd from "../git-cmd";

export default class LogDialog extends Dialog {

	initialState(props) {
		const state = {
			format: props.format || "medium",
			logs: "",
			offset: 0,
			loading: false,
			gitCmd: props.gitCmd || gitCmd,
			root: props.root,
			error: null,
		};

		return state;
	}

	async getLogs() {
		this.update({
			loading: true,
			error: null,
		});
		let {format} = this.state;
		format = format.replace(/\\n/g, "%n");

		// unescape slashes
		try {
			// add another escaped slash if the string ends with an odd
			// number of escaped slashes which will crash JSON.parse
			let parsedFormat = format.replace(/(?:^|[^\\])(?:\\\\)*\\$/, "$&\\");
			parsedFormat = JSON.parse(`"${format}"`);
			format = parsedFormat;
		} catch (e) {}

		try {
			const newLogs = await this.state.gitCmd.log(this.state.root, 10, this.state.offset, format);
			this.update({
				logs: `${this.state.logs}\n\n${newLogs}`,
				offset: this.state.offset + 10,
				loading: false,
			});
			if (this.state.format !== this.refs.formatInput.value) {
				this.formatChange({target: this.refs.formatInput});
			} else if (newLogs.trim() !== "") {
				this.scroll({target: this.refs.logs});
			}
		} catch (err) {
			console.log(err);
			this.update({
				loading: false,
				error: err,
			});
		}
	}

	scroll(e) {
		if (!this.state.loading && !this.state.error && e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 100) {
			this.getLogs();
		}
	}

	formatChange(e) {
		if (!this.state.loading) {
			this.update({
				format: e.target.value,
				logs: "",
				offset: 0,
			});
			this.getLogs();
		}
	}

	show() {
		this.getLogs();
		this.refs.formatInput.focus();
	}

	body() {
		let message = this.state.logs;
		if (this.state.loading) {
			message += "\nLoading More...";
		}
		if (this.state.error) {
			message = this.state.error;
		}

		return (
			<div>
				<textarea ref="logs" className="logs input-textarea native-key-bindings" tabIndex="1" attributes={{readonly: true}} value={message.trim()} on={{scroll: this.scroll}} />
				<label className="input-label">
					Log Format
					<a href="https://git-scm.com/docs/git-log#_pretty_formats" className="format-info" tabIndex="2"><i className="icon icon-info"></i></a>
					<input type="text" ref="formatInput" tabIndex="3" className="native-key-bindings input-text" value={this.state.format} on={{input: this.formatChange}} />
				</label>
			</div>
		);
	}

	title() {
		return "Git Log";
	}

	buttons() {
		return null;
	}
}
