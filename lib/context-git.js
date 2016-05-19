"use babel";
/* globals atom */

import {
	CompositeDisposable,
	BufferedProcess
} from "atom";
import fs from "fs";
import path from "path";
import dialog from "./commit-dialog";
//import dialog from "./dialog.js";

export default {

	subscriptions: null,

	activate(state) {
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"context-git:commit": (event) => {
				this.commit(event);
			}
		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

	commit(event) {
		// get path for context
		let filePath = this.getPath(event.target);
		if (!filePath) {
			console.error("no path found");
			return;
		}
		// get directory for path
		let cwd = "";
		let root = "";
		this.getDirectory(filePath)
			.then((dir) => {
				cwd = dir;
				// gt root git directory
				return this.gitRootDir(cwd);
			})
			.then((dir) => {
				root = dir;
				// get status of git files for path
				return Promise.all([this.gitStatus(cwd, filePath), this.gitLastCommit(cwd)]);
			})
			.then(([files, lastCommit]) => {
				if (files.length === 0) {
					throw "No files to commit"; // TODO: should be a notification
				}
				// show commit dialog for commit message
				return new Promise((resolve) => {
					new dialog().activate(files, lastCommit, (message, amend, files) => {
						resolve({message, amend, files});
					});
				});
			})
			.then(({message, amend, files}) => {
				// commit files
				return this.gitCommit(cwd, message, amend, files.map((file) => (path.resolve(root, file))));
			})
			.catch((err) => {
				console.error(err, "stack:", err.stack);
			});
	},

	getPath(target) {
		const treeView = target.closest(".tree-view");
		if (treeView) {
			// called from treeview
			const selected = treeView.querySelector(".selected .name");
			if (!selected) {
				console.error("no file/folder selected");
			} else {
				return selected.dataset.path;
			}
		} else {
			const tab = target.closest(".texteditor.tab");
			if (tab) {
				// called from tab
				return tab.querySelector(".title").dataset.path;
			} else if (target.getModel && target.getModel().getPath) {
				return target.getModel().getPath();
			}
		}

		return null;
	},

	getDirectory(filePath) {
		return new Promise((resolve) => {
			fs.stat(filePath, (err, stats) => {
				if (err) {
					throw err;
				}

				if (stats.isFile()) {
					resolve(path.dirname(filePath));
				} else {
					resolve(filePath);
				}
				// FIXME: what about symlink, etc.
			});
		});
	},

	git(cwd, args) {
		return new Promise((resolve) => {
			let output = "";
			new BufferedProcess({
				command: "git", // atom.config.get('context-git.gitPath'),
				args: args,
				options: {
					cwd: cwd,
					env: process.env
				},
				stdout: (data) => {
					output += data.toString();
				},
				stderr: (data) => {
					output += data.toString();
				},
				exit: (code) => {
					if (code === 0) {
						resolve(output);
					} else {
						throw output;
					}
				}
			});
		});
	},

	gitAdd(cwd, files) {
		return this.git(cwd, ["add"].concat("--", files))
			.then((result) => {
				if (result !== "") {
					throw result;
				}
			});
	},

	gitRootDir(cwd) {
		return this.git(cwd, ["rev-parse", "--show-toplevel"])
			.then((result) => {
				return result.trimRight().replace("/", path.sep);
			});
	},

	gitCommit(cwd, message, amend, files) {
		let args = ["commit", "-m", message, "-q"];
		if (amend) {
			args.push("--amend");
		}
		return this.gitAdd(cwd, files)
			.then(() => {
				return this.git(cwd, args.concat("--", files));
			})
			.then((result) => {
				if (result !== "") {
					throw result;
				}
			});
	},

	gitReset(cwd) {
		return this.git(cwd, ["reset", "HEAD", "-q"])
			.then((result) => {
				if (result !== "") {
					throw result;
				}
			});
	},

	gitLastCommit(cwd) {
		return this.git(cwd, ["log", "-1", "--oneline"])
			.then((result) => {
				return result.trimRight().replace(/^\S+ /, "");
			});
	},

	gitStatus(cwd, filePath) {
		return this.git(cwd, ["status", "--porcelain", "-u", filePath])
			.then((result) => {
				if (result === "") {
					return [];
				}
				const files = result.trimRight().split("\n").map((line) => {
					const lineMatch = line.match(/^([ MADRC?]{2}) "?(.*?)"?$/);
					if (!lineMatch) {
						throw "git status output invalid: '" + line.replace(" ", "·") + "'";
					}
					const [, code, file] = lineMatch;
					let added = false;
					let untracked = false;
					let deleted = false;
					let changed = false;
					switch (code) {
						case "M ":
							added = true;
							changed = true;
							break;
						case " M":
							changed = true;
							break;
						case "D ":
							added = true;
							deleted = true;
							break;
						case " D":
							deleted = true;
							break;
						case "A ":
							added = true;
							untracked = true;
							break;
						case "??":
							untracked = true;
							break;
						default:
							throw "Unknown code: '" + line.replace(" ", "·") + "'";
					}

					return {
						added,
						untracked,
						deleted,
						changed,
						file,
					};
				});
				return files;
			});
	}
	// getFiles(filePath) {
	//
	// 	return new Promise((resolve) => {
	//
	// 		fs.stat(filePath, (err, stats) => {
	// 			if (err) {
	// 				throw err;
	// 			}
	// 			if (stats.isFile()) {
	// 				resolve([filePath]);
	// 			} else {
	// 				fs.readdir(filePath, (err, files) => {
	// 					Promise.all(files.map((file) => {
	// 							return this.getFiles(path.resolve(filePath, file));
	// 						}))
	// 						.then((files) => {
	// 							// files will  be an array of arrays.
	// 							// We want to change it to a flat array.
	// 							resolve([].concat.apply([], files));
	// 						});
	// 				});
	// 			}
	// 		});
	// 	});
	// }

};
