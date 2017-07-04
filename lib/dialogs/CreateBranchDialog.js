"use babel";
/** @jsx etch.dom */

import git from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";

export default class CreateBranchDialog extends Dialog {

	beforeInitialize() {
		this.fetch = this.fetch.bind(this);
		this.sourceBranchChange = this.sourceBranchChange.bind(this);
		this.newBranchChange = this.newBranchChange.bind(this);
		this.trackChange = this.trackChange.bind(this);
	}

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		let state = {
			branches: props.branches || [],
			sourceBranch: "",
			newBranch: "",
			track: false,
			root: props.root,
			fetching: false
		};

		state.sourceBranch = state.branches.reduce((prev, branch) => (branch.selected ? branch.name : prev), "");

		return state;
	}

	validate(state) {
		let error = false;
		if (!state.newBranch) {
			error = true;
			this.refs.newBranchInput.classList.add("error");
		}
		if (!state.sourceBranch) {
			error = true;
			this.refs.sourceBranchInput.classList.add("error");
		}
		if (error) {
			return;
		}
		const newBranch = this.removeIllegalChars(state.newBranch);

		return [state.sourceBranch, newBranch, state.track, ];
	}

	show() {
		this.refs.newBranchInput.focus();
	}

	async fetch() {
		this.update({ fetching: true });
		try {
			await git.fetch(this.state.root);
			const branches = await git.branches(this.state.root);
			this.update({ branches: branches, fetching: false });
		} catch (err) {
			atom.notifications.addError(err, { dismissable: true });
			this.update({ fetching: false });
		}
	}

	sourceBranchChange(e) {
		this.refs.sourceBranchInput.classList.remove("error");
		this.update({ sourceBranch: e.target.value });
	}

	newBranchChange(e) {
		this.refs.newBranchInput.classList.remove("error");
		this.update({ newBranch: e.target.value });
	}

	trackChange(e) {
		this.update({ track: e.target.checked });
	}

	removeIllegalChars(branchName) {
		// from https://www.kernel.org/pub/software/scm/git/docs/git-check-ref-format.html#_description
		return branchName.replace(/^[\./]|[\./]$|^@$|[\s~^:[\\?*\x00-\x20\x7F]/g, "-")
			.replace(/\.\.|@{/g, "--");
	}

	body() {
		const branchOptions = this.state.fetching ? (
			<option>Fetching...</option>
		) : this.state.branches.map(branch => (
			<option value={branch.name} selected={branch.name === this.state.sourceBranch}>{branch.path}</option>
		));

		const actualName = this.removeIllegalChars(this.state.newBranch);

		return (
			<div>
				<label className="input-label">
					New Branch
					<input type="text" ref="newBranchInput" tabIndex="1" className="native-key-bindings input-text" value={this.state.newBranch} oninput={this.newBranchChange}/>
				</label>
				<div className="actual-name">{this.state.newBranch !== actualName ? "Will be created as " + actualName : ""}</div>
				<label className="input-label">
					Source Branch
					<select ref="sourceBranchInput" tabIndex="2" className="native-key-bindings input-select" value={this.state.sourceBranch} disabled={this.state.fetching} onchange={this.sourceBranchChange}>
						{branchOptions}
					</select>
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="3" checked={this.state.track} onchange={this.trackChange}/>
					Track {this.state.newBranch ? "origin/" + actualName : ""}
				</label>
			</div>
		);
	}

	title() {
		return "Create Branch";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="4" onclick={this.accept} disabled={this.state.fetching}>
					Create Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="5" onclick={this.fetch} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}
