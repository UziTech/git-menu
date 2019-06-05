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
			return files.map(file => {
				return {
					name: file.file,
					checked: true,
					indeterminate: false,
					file,
					parent: null,
				};
			});
		}

		files.sort((a, b) => {
			const aPaths = a.file.split("/");
			const bPaths = b.file.split("/");
			const len = Math.min(aPaths.length, bPaths.length);
			for (let i = 0; i < len; i++) {
				let comp = 0;
				// sort directories first
				if (i === aPaths.length - 1 && i < bPaths.length - 1) {
					comp = 1;
				} else if (i < aPaths.length - 1 && i === bPaths.length - 1) {
					comp = -1;
				} else {
					comp = aPaths[i].localeCompare(bPaths[i]);
				}

				if (comp !== 0) {
					return comp;
				}
			}
			return bPaths.length - aPaths.length;
		});

		const treeFiles = [];

		for (const f of files) {
			const paths = f.file.split("/");
			let parent = null;
			let currentLevel = treeFiles;
			for (let i = 0; i < paths.length; i++) {
				const isFile = (i === paths.length - 1);
				const p = paths[i] + (isFile ? "" : "/");
				let level = currentLevel.find(l => l.name === p);
				if (!level) {
					if (isFile) {
						level = {
							name: p,
							checked: true,
							indeterminate: false,
							file: f,
							parent,
						};
					} else {
						level = {
							name: p,
							checked: true,
							indeterminate: false,
							collapsed: false,
							files: [],
							parent,
						};
					}
					currentLevel.push(level);
				}
				parent = level;
				currentLevel = level.files;
			}
		}

		const combineEmptyFolders = (filesArr, parent = null) => {

			for (let i = 0; i < filesArr.length; i++) {
				const obj = filesArr[i];
				const {name} = obj;
				if (!obj.files) {
					continue;
				}
				if (obj.files.length === 1) {
					const newName = `${name}${obj.files[0].name}`;
					filesArr.splice(i, 1, obj.files[0]);
					filesArr[i].parent = parent;
					filesArr[i].name = newName;
					i--;
				} else {
					obj.files = combineEmptyFolders(obj.files, obj);
				}
			}

			return filesArr;
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

			for (const file of files) {
				file.indeterminate = false;
				file.checked = checked;
				changeChildren(file.files, checked);
			}
		};

		const changeParent = (parent, checked) => {
			if (!parent) {
				return;
			}

			let hasChecked = false;
			let hasUnchecked = false;
			let hasIndeterminate = false;

			for (const file of parent.files) {
				if (file.checked) {
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
				if (file.indeterminate) {
					hasIndeterminate = true;
					break;
				}
			}

			parent.checked = hasChecked && !(hasIndeterminate || hasUnchecked);
			parent.indeterminate = hasIndeterminate || (hasChecked && hasUnchecked);
			changeParent(parent.parent, checked);
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

			for (const obj of files) {
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

	changeCollapsed(collapsed) {
		const collapse = (files) => {
			for (const file of files) {
				if (file.files) {
					file.collapsed = collapsed;
					collapse(file.files);
				}
			}
		};

		collapse(this.state.fileList);
		this.update();
	}

	hasDirs() {
		for (const file of this.state.fileList) {
			if (file.files) {
				return true;
			}
		}

		return false;
	}

	render() {
		let tabIndex = +this.state.tabIndexStart;
		const renderItems = (files) => {
			return files.map(obj => {
				let checkbox = "";
				if (this.state.showCheckboxes) {
					checkbox = (
						<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={tabIndex++} attributes={{name: obj.name}}
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
						<li className={classes.join(" ")} title={obj.file.file}>
							<label className="input-label">
								{checkbox}
								<span>{obj.name}</span>
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
									<span className="icon icon-file-directory">{obj.name}</span>
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
				{
					this.hasDirs() ? (
						<div className="buttons">
							<button tabIndex={tabIndex++} on={{click: () => this.changeCollapsed(true)}}>Collapse All</button>
							<button tabIndex={tabIndex++} on={{click: () => this.changeCollapsed(false)}}>Expand All</button>
						</div>
					) : ""
				}
				<div className="files">
					<ul>
						{renderItems(this.state.fileList)}
					</ul>
				</div>
			</div>
		);
	}
}
