/** @babel */

/** @jsx etch.dom */

import gitCmd from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";
import Notifications from "../Notifications";

export default class SwitchBranchDialog extends Dialog {

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		this.git = props.git || gitCmd;
		this.notifications = props.notifications || Notifications;

		const state = {
			branches: props.branches || [],
			branch: "",
			root: props.root,
			fetching: false,
		};

		const branch = state.branches.find(b => b.selected);
		state.branch = branch ? branch.name : "";

		return state;
	}

	validate(state) {
		let error = false;
		if (!state.branch) {
			error = true;
			this.refs.branchInput.classList.add("error");
		}
		if (error) {
			return;
		}

		const branch = state.branches.find(b => b.name === state.branch);
		let name = state.branch;
		let remote = branch && branch.remote ? "origin" : null;
		if (!remote) {
			const isRemote = state.branch.match(/^remotes\/([^/]+)\/(.+)$/);
			if (isRemote) {
				[, remote, name] = isRemote;
			}
		}

		return [name, remote];
	}

	show() {
		this.refs.branchInput.focus();
	}

	async fetch() {
		this.update({fetching: true});
		try {
			await this.git.fetch(this.state.root);
			const branches = await this.git.branches(this.state.root);
			this.update({branches: branches, fetching: false});
		} catch (err) {
			this.notifications.addError("Fetch", err);
			this.update({fetching: false});
		}
	}

	branchChange(e) {
		this.refs.branchInput.classList.remove("error");
		this.update({branch: e.target.value});
	}

	body() {
		let branchOptions;
		if (this.state.fetching) {
			branchOptions = (
				<option>Fetching...</option>
			);
		} else {
			branchOptions = this.state.branches.map(branch => (
				<option value={branch.name} selected={branch.name === this.state.branch}>{branch.branch}</option>
			));
		}

		return (
			<div>
				<label className="input-label">
					<select ref="branchInput" tabIndex="1" className="native-key-bindings input-select" value={this.state.branch} disabled={this.state.fetching} on={{change: this.branchChange}}>
						{branchOptions}
					</select>
				</label>
			</div>
		);
	}

	title() {
		return "Switch Branch";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="2" on={{click: this.accept}} disabled={this.state.fetching}>
					Switch Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="3" on={{click: this.fetch}} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}
