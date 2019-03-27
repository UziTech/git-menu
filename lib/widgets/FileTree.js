/** @babel */

/** @jsx etch.dom */

import etch from "etch";

export default class FileTree {

	constructor({files = [], showCheckboxes = true, onFileChange = () => {}} = {}) {
		this.state = {
			files,
			showCheckboxes,
			onFileChange,
		};

		etch.initialize(this);
	}

	update(props) {
		if (props) {
			this.setState(props);
		}

		return etch.update(this);
	}

	setState(state) {
		this.state = {...this.state, ...state};
	}

	destroy() {
		return etch.destroy(this);
	}

	fileChange(idx) {
		return (e) => {
			const files = this.state.files.map((file, i) => {
				if (idx === i) {
					file.selected = e.target.checked;
				}
				return file;
			});
			this.state.onFileChange(idx, e.target.checked);
			this.update({files});
		};
	}

	getSelectedFiles() {
		return this.state.files.filter(file => file.selected).map(file => file.file);
	}

	render() {

		const files = this.state.files.map((file, idx) => {
			const classes = ["file"];
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
			let checkbox = "";
			if (this.state.showCheckboxes) {
				checkbox = (
					<input className="native-key-bindings input-checkbox" type="checkbox" checked={file.selected} onchange={this.fileChange(idx)}/>
				);
			}
			return (
				<div className={classes.join(" ")}>
					<label className="input-label">
						{checkbox}
						{file.file}
					</label>
				</div>
			);
		});

		return (
			<div className="files" ref="files">
				{files}
			</div>
		);
	}
}
