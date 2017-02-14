"use babel";
/** @jsx etch.dom */

import git from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";

export default class SwitchBranchDialog extends Dialog {

	beforeInitialize() {
		this.fetch = this.fetch.bind(this);
		this.branchChange = this.branchChange.bind(this);
	}

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		let state = {
			branches: props.branches || [],
			branch: "",
			root: props.root,
			fetching: false,
		};

		state.branch = state.branches.reduce((prev, branch) => (branch.selected ? branch.name : prev), "");

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

		return [state.branch];
	}

	show() {
		this.refs.branchInput.focus();
	}

	fetch() {
		this.update({fetching: true});
		git.fetch(this.state.root).then(_ => git.branches(this.state.root)).then(branches => {
			this.update({branches: branches, fetching: false});
		}).catch();
	}

	branchChange(e) {
		this.refs.branchInput.classList.remove("error");
		this.update({branch: e.target.value});
	}

	body() {
		const branchOptions = this.state.fetching ? (
			<option>Fetching...</option>
		) : this.state.branches.map(branch => (
			<option value={branch.name}>{branch.path}</option>
		));

		return (
			<div>
				<label>
					Branch
					<select ref="branchInput" tabIndex="1" className="native-key-bindings" value={this.state.branch} disabled={this.state.fetching} onchange={this.branchChange}>
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
				<button tabIndex="2" onclick={this.accept} disabled={this.state.fetching}>
					<i className="icon branch"></i>
					<span>Switch Branch</span>
				</button>
				<button tabIndex="3" onclick={this.fetch} disabled={this.state.fetching}>
					<i className="icon sync"></i>
					<span>Fetch</span>
				</button>
				<button tabIndex="4" onclick={this.cancel}>
					<i className="icon x"></i>
					<span>Cancel</span>
				</button>
			</div>
		);
	}
}
