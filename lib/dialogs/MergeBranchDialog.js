/** @babel */

/** @jsx etch.dom */

import gitCmd from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";
import Notifications from "../Notifications";

export default class MergeBranchDialog extends Dialog {

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		this.git = props.git || gitCmd;
		this.notifications = props.notifications || Notifications;

		const state = {
			branches: props.branches || [],
			rootBranch: "",
			mergeBranch: "",
			delete: false,
			root: props.root,
			fetching: false,
		};

		const branch = state.branches.find(b => b.selected);
		state.rootBranch = branch ? branch.name : "";

		return state;
	}

	validate(state) {
		let error = false;
		if (!state.rootBranch) {
			this.refs.rootBranchInput.classList.add("error");
			error = true;
		}
		if (!state.mergeBranch) {
			this.refs.mergeBranchInput.classList.add("error");
			error = true;
		}
		if (state.rootBranch === state.mergeBranch) {
			this.refs.rootBranchInput.classList.add("error");
			this.refs.mergeBranchInput.classList.add("error");
			error = true;
		}
		if (error) {
			return;
		}

		const rootBranch = state.branches.find(b => b.name === state.rootBranch) || {};
		const mergeBranch = state.branches.find(b => b.name === state.mergeBranch) || {};

		return [rootBranch, mergeBranch, state.delete];
	}

	show() {
		this.refs.mergeBranchInput.focus();
	}

	async fetch() {
		this.update({fetching: true});
		try {
			await this.git.fetch(this.state.root);
			const branches = await this.git.branches(this.state.root, false);
			this.update({branches: branches, fetching: false});
		} catch (err) {
			this.notifications.addError("Fetch", err);
			this.update({fetching: false});
		}
	}

	rootBranchChange(e) {
		this.refs.rootBranchInput.classList.remove("error");
		this.update({rootBranch: e.target.value});
	}

	mergeBranchChange(e) {
		this.refs.mergeBranchInput.classList.remove("error");
		this.update({mergeBranch: e.target.value});
	}

	deleteChange(e) {
		this.update({delete: e.target.checked});
	}

	body() {
		let rootBranchOptions, mergeBranchOptions;
		if (this.state.fetching) {
			rootBranchOptions = (
				<option>Fetching...</option>
			);
			mergeBranchOptions = (
				<option>Fetching...</option>
			);
		} else {
			rootBranchOptions = this.state.branches.map(b => (
				<option value={b.name} selected={b.name === this.state.rootBranch}>{b.branch}</option>
			));
			mergeBranchOptions = this.state.branches.map(b => (
				<option value={b.name} selected={b.name === this.state.mergeBranch}>{b.branch}</option>
			));
		}

		return (
			<div>
				<label className="input-label">
					Root Branch
					<select ref="rootBranchInput" tabIndex="1" className="native-key-bindings input-select" value={this.state.rootBranch} disabled={this.state.fetching} on={{change: this.rootBranchChange}}>
						{rootBranchOptions}
					</select>
				</label>
				<label className="input-label">
					Merge Branch
					<select ref="mergeBranchInput" tabIndex="2" className="native-key-bindings input-select" value={this.state.mergeBranch} disabled={this.state.fetching} on={{change: this.mergeBranchChange}}>
						{mergeBranchOptions}
					</select>
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="3" checked={this.state.force} on={{change: this.deleteChange}} />
					Delete branch {this.state.mergeBranch}
				</label>
			</div>
		);
	}

	title() {
		return "Merge Branch";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="4" on={{click: this.accept}} disabled={this.state.fetching}>
					Merge Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="5" on={{click: this.fetch}} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}
