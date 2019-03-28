/** @babel */

/** @jsx etch.dom */

import etch from "etch";

export default class FileTree {

	constructor({files = [], showCheckboxes = true, tabIndexStart = 1, treeView = true} = {}) {
		this.state = {
			fileList: this.convertFiles(files, treeView),
			showCheckboxes,
			tabIndexStart,
		};

		etch.initialize(this);
	}

	convertFiles(files, treeView) {

		if (!treeView) {
			return files.reduce((obj, file) => {
				obj[file.file] = {
					checked: true,
					indeterminate: false,
					file,
					parent: null,
				};

				return obj;
			}, {});
		}

		files.sort((a, b) => {
			// sort dirs first
			const aPaths = a.file.split("/");
			const bPaths = b.file.split("/");
			const len = Math.min(aPaths.length, bPaths.length);
			for (let i = 0; i < len; i++) {
				const comp = aPaths[i].localeCompare(bPaths[i]);
				if (comp !== 0) {
					return comp;
				}
			}
			return bPaths.length - aPaths.length;
		});

		const treeFiles = {};

		// FIXME: file and folder with same path?
		//        ["a/b/c.js", "a/b/c.js/d.js"]
		//        Should be rare but could happen.

		for (const f of files) {
			const paths = f.file.split("/");
			let parent = null;
			let currentLevel = treeFiles;
			for (let i = 0; i < paths.length; i++) {
				const p = paths[i];
				const isFile = (i === paths.length - 1);
				if (!currentLevel[p]) {
					if (isFile) {
						currentLevel[p] = {
							checked: true,
							indeterminate: false,
							file: f,
							parent,
						};
					} else {
						currentLevel[p] = {
							checked: true,
							indeterminate: false,
							collapsed: false,
							files: {},
							parent,
						};
					}
				}
				parent = currentLevel[p];
				currentLevel = currentLevel[p].files;
			}
		}

		const combineEmptyFolders = (filesObj) => {
			const namesToCheck = Object.keys(filesObj);

			for (let i = 0; i < namesToCheck.length; i++) {
				const name = namesToCheck[i];
				const obj = filesObj[name];
				if (!obj.files) {
					continue;
				}
				const list = Object.keys(obj.files);
				if (list.length === 1) {
					const newName = `${name}/${list[0]}`;
					filesObj[newName] = obj.files[list[0]];
					delete filesObj[name];
					namesToCheck.push(newName);
				} else {
					obj.files = combineEmptyFolders(obj.files);
				}
			}

			return filesObj;
		};

		return combineEmptyFolders(treeFiles);
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

	checkboxChange(obj) {
		const changeChildren = (files, checked) => {
			if (!files) {
				return;
			}

			for (const name in files) {
				files[name].indeterminate = false;
				files[name].checked = checked;
				if (files[name].files) {
					changeChildren(files[name].files, checked);
				}
			}
		};

		const changeParent = (parent, checked) => {
			if (!parent) {
				return;
			}

			let hasChecked = false;
			let hasUnchecked = false;
			let hasIndeterminate = false;

			for (const name in parent.files) {
				if (parent.files[name].checked) {
					hasChecked = true;
					if (hasUnchecked) {
						break;
					}
				} else {
					hasUnchecked = true;
					if (hasChecked) {
						break;
					}
				}
				if (parent.files[name].indeterminate) {
					hasIndeterminate = true;
					break;
				}
			}

			parent.checked = hasChecked && !(hasIndeterminate || hasUnchecked);
			parent.indeterminate = hasIndeterminate || (hasChecked && hasUnchecked);

			return changeParent(parent.parent, checked);
		};

		return ({target: {checked}}) => {
			obj.indeterminate = false;
			obj.checked = checked;
			changeChildren(obj.files, checked);
			changeParent(obj.parent, checked);

			this.update();
		};
	}

	dirClick(obj) {
		return () => {
			obj.collapsed = !obj.collapsed;
			this.update();
		};
	}

	getSelectedFiles() {

		const checkedFiles = (files) => {
			let arr = [];

			for (const name in files) {
				const obj = files[name];
				if (obj.file) {
					if (obj.checked) {
						arr.push(obj.file.file);
					}
				} else {
					arr = [...arr, ...checkedFiles(obj.files)];
				}
			}

			return arr;
		};

		return checkedFiles(this.state.fileList);
	}

	render() {
		let tabIndex = this.state.tabIndexStart;
		const renderItems = (files) => {
			return Object.keys(files).map(name => {
				const obj = files[name];

				let checkbox = "";
				if (this.state.showCheckboxes) {
					checkbox = (
						<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={tabIndex++}
							checked={obj.checked} indeterminate={obj.indeterminate} onchange={this.checkboxChange(obj)}/>
					);
				}

				const classes = [];
				if (!obj.checked && !obj.indeterminate) {
					classes.push("unchecked");
				}
				let li;
				if (obj.file) {
					classes.push("file");
					if (obj.file.added) {
						classes.push("added");
					}
					if (obj.file.untracked) {
						classes.push("untracked");
					}
					if (obj.file.deleted) {
						classes.push("deleted");
					}
					if (obj.file.changed) {
						classes.push("changed");
					}
					li = (
						<li className={classes.join(" ")}>
							<label className="input-label">
								{checkbox}
								<span>{name}</span>
							</label>
						</li>
					);
				} else {
					classes.push("dir");
					if (obj.collapsed) {
						classes.push("collapsed");
					}
					li = (
						<li className={classes.join(" ")}>
							<span className="input-label">
								{checkbox}
								<span className={`icon ${obj.collapsed ? "icon-chevron-right" : "icon-chevron-down"}`} onclick={this.dirClick(obj)}>
									<span className="icon icon-file-directory">{name}</span>
								</span>
							</span>
							<ul>
								{renderItems(obj.files)}
							</ul>
						</li>
					);
				}

				return li;
			});
		};

		return (
			<div className="file-tree">
				<ul>
					{renderItems(this.state.fileList)}
				</ul>
			</div>
		);
	}
}
