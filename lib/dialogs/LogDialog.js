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
		try {
			const newLogs = await this.state.gitCmd.log(this.state.root, 10, this.state.offset, this.state.format);
			this.update({
				logs: `${this.state.logs}\n\n${newLogs}`.trim(),
				offset: this.state.offset + 10,
				loading: false,
			});
			this.scroll({target: this.refs.logs});
		} catch (err) {
			console.log(err);
			this.update({
				loading: false,
				error: err,
			});
		}
	}

	scroll(e) {
		if (!this.state.loading && !this.state.error && e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 50) {
			this.state.loading = true;
			this.getLogs();
		}
	}

	formatChange(e) {
		this.update({
			format: e.target.value,
			logs: "",
			offset: 0,
		});
		if (!this.state.loading) {
			this.getLogs();
		}
	}

	show() {
		this.getLogs();
	}

	body() {
		let message = this.state.logs;
		if (this.state.loading) {
			message += "\n\nLoading...";
		}
		if (this.state.error) {
			message = this.state.error;
		}

		return (
			<div>
				<textarea ref="logs" className="logs input-textarea native-key-bindings" tabIndex="1" attributes={{readonly: true}} value={message} on={{scroll: this.scroll}} />
				<label className="input-label">
					Log Format
					<input type="text" ref="formatInput" tabIndex="2" className="native-key-bindings input-text" value={this.state.format} on={{input: this.formatChange}} />
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
