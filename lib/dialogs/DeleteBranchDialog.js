/** @babel */

/** @jsx etch.dom */

import gitCmd from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";
import Notifications from "../Notifications";
import {promisify} from "promisificator";

export default class DeleteBranchDialog extends Dialog {

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		this.git = props.git || gitCmd;
		this.notifications = props.notifications || Notifications;

		const state = {
			branches: props.branches || [],
			branch: "",
			local: true,
			remote: false,
			force: false,
			root: props.root,
			fetching: false,
		};

		const branch = state.branches.find(b => b.selected);
		state.branch = branch ? branch.name : "";

		return state;
	}

	async validate(state) {
		if (!state.branch) {
			this.refs.branchInput.classList.add("error");
			return;
		}
		if (state.local && state.remote) {
			const [, major, minor] = atom.getVersion().match(/^(\d+)\.(\d+)\.(\d+)/);
			let confirmButton, hideDialog;
			if (major > 1 || minor > 24) {
				[confirmButton, hideDialog] = await promisify(atom.confirm.bind(atom), {rejectOnError: false, alwaysReturnArray: true})({
					type: "warning",
					checkboxLabel: "Never Show This Dialog Again",
					message: "Are you sure you want to delete the local and remote branches?",
					detail: `You are deleting:\n${state.branch}\norigin/${state.branch}`,
					buttons: [
						"Delete Branches",
						"Cancel",
					]
				});
			} else {
				const response = atom.confirm({
					message: "Are you sure you want to delete the local and remote branches?",
					detailedMessage: `You are deleting:\n${state.branch}\norigin/${state.branch}`,
					buttons: [
						"Delete Branches",
						"Never Show This Dialog Again",
						"Cancel",
					]
				});

				hideDialog = (response === 1);
				confirmButton = (response === 0 ? response : response - 1);
			}

			if (hideDialog) {
				atom.config.set("git-menu.confirmationDialogs.deleteRemote", false);
			}
			if (confirmButton === 1) {
				return;
			}
		}


		const branch = state.branches.find(b => b.name === state.branch) || {};
		const local = !!(branch.local && state.local);
		const remote = !!(branch.remote && state.remote);

		return [branch, local, remote, state.force];
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

	remoteChange(e) {
		this.update({remote: e.target.checked});
	}

	localChange(e) {
		this.update({local: e.target.checked});
	}

	forceChange(e) {
		this.update({force: e.target.checked});
	}

	body() {
		let branchOptions;
		if (this.state.fetching) {
			branchOptions = (
				<option>Fetching...</option>
			);
		} else {
			branchOptions = this.state.branches.map(b => (
				<option value={b.name} selected={b.name === this.state.branch}>{b.branch}</option>
			));
		}

		const branch = this.state.branches.find(b => b.name === this.state.branch);
		const local = branch ? branch.local : false;
		const remote = branch ? branch.remote : false;

		return (
			<div>
				<label className="input-label">
					<select ref="branchInput" tabIndex="1" className="native-key-bindings input-select" value={this.state.branch} disabled={this.state.fetching} on={{change: this.branchChange}}>
						{branchOptions}
					</select>
				</label>
				<label className={`input-label checkbox-label ${local ? "" : "input-disabled"}`}>
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="2" disabled={!local} checked={local && this.state.local} on={{change: this.localChange}} />
					Delete local branch {this.state.branch}
				</label>
				<label className={`input-label checkbox-label ${remote ? "" : "input-disabled"}`}>
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="3" disabled={!remote} checked={remote && this.state.remote} on={{change: this.remoteChange}} />
					Delete remote branch origin/{this.state.branch}
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="4" checked={this.state.force} on={{change: this.forceChange}} />
					Force
				</label>
			</div>
		);
	}

	title() {
		return "Delete Branch";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="5" on={{click: this.accept}} disabled={this.state.fetching}>
					Delete Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="6" on={{click: this.fetch}} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}
