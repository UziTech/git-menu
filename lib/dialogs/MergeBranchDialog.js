/** @babel */

/** @jsx etch.dom */

import gitCmd from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";
import Notifications from "../Notifications";
import {promisify} from "promisificator";

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
			rebase: false,
			delete: false,
			abort: true,
			root: props.root,
			fetching: false,
		};

		const selectedBranch = state.branches.find(b => b.selected);
		state.rootBranch = selectedBranch ? selectedBranch.name : "";
		const masterBranch = state.branches.find(b => b.name === "master");
		state.mergeBranch = masterBranch ? masterBranch.name : "";

		return state;
	}

	async validate(state) {
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

		if (state.delete) {
			const [confirmButton, hideDialog] = await promisify(atom.confirm.bind(atom), {rejectOnError: false, alwaysReturnArray: true})({
				type: "warning",
				checkboxLabel: "Never Show This Dialog Again",
				message: "Are you sure you want to delete the branch after merging?",
				detail: `You are deleting:\n${state.mergeBranch}`,
				buttons: [
					"Delete Branch",
					"Cancel",
				],
			});

			if (hideDialog) {
				atom.config.set("git-menu.confirmationDialogs.deleteAfterMerge", false);
			}
			if (confirmButton === 1) {
				return;
			}
		}

		return [rootBranch, mergeBranch, state.rebase, state.delete, state.abort];
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

	rebaseChange(e) {
		this.update({rebase: e.target.checked});
	}

	deleteChange(e) {
		this.update({delete: e.target.checked});
	}

	abortChange(e) {
		this.update({abort: e.target.checked});
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
					Merge:
					<select ref="mergeBranchInput" tabIndex="1" className="native-key-bindings input-select" value={this.state.mergeBranch} disabled={this.state.fetching} on={{change: this.mergeBranchChange}}>
						{mergeBranchOptions}
					</select>
				</label>
				<label className="input-label">
					Into:
					<select ref="rootBranchInput" tabIndex="2" className="native-key-bindings input-select" value={this.state.rootBranch} disabled={this.state.fetching} on={{change: this.rootBranchChange}}>
						{rootBranchOptions}
					</select>
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="3" checked={this.state.rebase} on={{change: this.rebaseChange}} />
					Rebase
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="4" checked={this.state.delete} on={{change: this.deleteChange}} />
					Delete {this.state.mergeBranch} branch after merge
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="5" checked={this.state.abort} on={{change: this.abortChange}} />
					Abort on failure
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
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="6" on={{click: this.accept}} disabled={this.state.fetching}>
					Merge Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="7" on={{click: this.fetch}} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}
