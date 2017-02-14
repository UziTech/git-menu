"use babel";
/** @jsx etch.dom */
/* globals atom */

import git from "../git-cmd";
import {$} from "atom-space-pen-views";
import InputView from "./InputView";
import etch from "etch";

export default class CreateBranchDialog {
	constructor(props, children) {

		this.state = {
			branches: [],
			sourceBranch: "",
			newBranch: "",
			track: false,
			root: "",
			fetching: false,
		};

		if (props.branches) {
			this.state.sourceBranch = props.branches.reduce((prev, branch) => (branch.selected
				? branch.name
				: prev), "");
		}

		this.setState(props);

		this.cancel = this.cancel.bind(this);
		this.keyup = this.keyup.bind(this);
		this.create = this.create.bind(this);
		this.fetch = this.fetch.bind(this);
		this.sourceBranchChange = this.sourceBranchChange.bind(this);
		this.newBranchChange = this.newBranchChange.bind(this);
		this.trackChange = this.trackChange.bind(this);

		etch.initialize(this);
	}

	update(props, children) {
		if (props) {
			this.setState(props);
		}

		return etch.update(this);
	}

	destroy() {
		return etch.destroy(this);
	}

	setState(state) {
		this.state = Object.assign({}, this.state, state);
	}

	activate() {
		this.refs.newBranchInput.change(this.newBranchChange);

		this.modalPanel = atom.workspace.addModalPanel({item: this});
		this.refs.newBranchInput.focus();

		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	deactivate() {
		this.modalPanel.destroy();
		this.destroy();
	}

	keyup(e) {
		switch (e.keyCode) {
			case 27:
				// esc
				this.cancel();
				break;
			case 13:
				// enter
				this.create();
				break;
			case 9:
				// tab
				break;
			default:
				// console.debug(e);
		}
	}

	cancel() {
		this.reject();
		this.deactivate();
	}

	create() {
		let error = false;
		if (!this.state.newBranch) {
			error = true;
			$(this.refs.newBranchInput).addClass("error");
		}
		if (!this.state.sourceBranch) {
			error = true;
			$(this.refs.sourceBranchInput).addClass("error");
		}
		if (error) {
			return;
		}
		this.resolve([this.state.sourceBranch, this.state.newBranch, this.state.track,]);
		this.deactivate();
	}

	fetch() {
		this.update({fetching: true});
		git.fetch(this.state.root).then(_ => git.branches(this.state.root)).then(branches => {
			this.update({branches: branches, fetching: false});
		}).catch();
	}

	sourceBranchChange(e) {
		$(this.refs.sourceBranchInput).removeClass("error");
		this.update({sourceBranch: e.target.value});
	}

	newBranchChange(e) {
		$(this.refs.newBranchInput).removeClass("error");
		this.update({newBranch: e.target.value});
	}

	trackChange(e) {
		this.update({track: e.target.checked});
	}

	render() {
		const branchOptions = this.state.fetching
			? (
				<option>Fetching...</option>
			)
			: this.state.branches.map(branch => (
				<option value={branch.name}>{branch.path}</option>
			));

		return (
			<div className="dialog context-git" onkeyup={this.keyup}>
				<div className="heading">
					<i className="icon x clickable" onclick={this.cancel}></i>
					<strong>Create Branch</strong>
				</div>
				<div className="body">
					<label>
						New Branch
						<InputView ref="newBranchInput" value={this.state.newBranch} onchange={this.newBranchChange}/>
					</label>
					<label>
						Source Branch
						<select ref="sourceBranchInput" value={this.state.sourceBranch} disabled={this.state.fetching} onchange={this.sourceBranchChange}>
							{branchOptions}
						</select>
					</label>
					<label>
						<input type="checkbox" checked={this.state.track} onchange={this.trackChange}/>
						Track {this.state.newBranch
							? "origin/" + this.state.newBranch
							: ""}
					</label>
				</div>
				<div className="buttons">
					<button className="active" onclick={this.create} disabled={this.state.fetching}>
						<i className="icon branch"></i>
						<span>Create Branch</span>
					</button>
					<button onclick={this.fetch} disabled={this.state.fetching}>
						<i className="icon sync"></i>
						<span>Fetch</span>
					</button>
					<button onclick={this.cancel}>
						<i className="icon x"></i>
						<span>Cancel</span>
					</button>
				</div>
			</div>
		);
	}
}
