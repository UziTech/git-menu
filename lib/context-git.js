"use babel";
/* globals atom */

import {
	CompositeDisposable
} from "atom";
import fs from "fs";
import path from "path";
import git from "./git-cmd";
import dialog from "./commit-dialog";
//import dialog from "./dialog.js";

export default {

	subscriptions: null,

	/**
	 * Activate package
	 * @return {void}
	 */
	activate() {
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"context-git:commit": (event) => {
				this.commit(event);
			}
		}));
	},

	/**
	 * Deactivate package
	 * @return {void}
	 */
	deactivate() {
		this.subscriptions.dispose();
	},

	/**
	 * Commit clicked
	 * @param  {MouseEvent} event The mouse click event
	 * @return {void}
	 */
	commit(event) {
		// get path for context
		const filePaths = this.getPaths(event.target);
		if (filePaths.length === 0) {
			atom.notifications.addError("Context Git", {
				detail: "No files selected.",
				dismissable: true
			});
			return;
		}
		// get directory for path
		let cwdFiles, cwds, root;
		this.getDirectories(filePaths)
			.then((cwdDirs) => {
				// remove duplicates
				cwdFiles = this.consolidateFiles(cwdDirs);
				cwds = Object.keys(cwdFiles);
				// gt root git directory
				return Promise.all(cwds.map((cwd) => (git.rootDir(cwd))));
			})
			.then((rootDirs) => {
				// remove duplicates
				const roots = [...new Set(rootDirs)];
				if (roots.length > 1) {
					throw "Selected files are not in the same repository";
				}
				root = roots[0];

				let promises = [git.lastCommit(root)].concat(cwds.map((cwd) => (git.status(cwd, cwdFiles[cwd]))));
				// get status of git files for path
				return Promise.all(promises);
			})
			.then(([lastCommit, ...statusArr]) => {
				const status = statusArr.reduce((prev, el) => (prev.concat(el)), []);
				if (status.length === 0) {
					atom.notifications.addError("Context Git", {
						detail: "No files to commit.",
						dismissable: true
					});
					throw false;
				}
				// show commit dialog for commit message
				return new Promise((resolve) => {
					new dialog().activate(status, lastCommit, (message, amend, files) => {
						resolve({
							message,
							amend,
							files
						});
					});
				});
			})
			.then(({
				message,
				amend,
				files
			}) => {
				// commit files
				return git.commit(root, message, amend, files.map((file) => (path.resolve(root, file))));
			})
			.then(() => {
				atom.notifications.addSuccess("Context Git", {
					detail: "Files committed",
					dismissable: true
				});
			})
			.catch((err) => {
				if (err) {
					atom.notifications.addFatalError("Context Git", {
						detail: err.toString() + (err.stack ? "\n" + err.stack : ""),
						dismissable: true
					});
				}
			});
	},

	/**
	 * Remove selected files where a parent folder is also selected and group by parent folder.
	 * @param  {Object[]} cwdDirs The result of getDirectories()
	 * @return {Object} Keys will be cwds and values will be an array of files for that cwd
	 */
	consolidateFiles(cwdDirs) {
		let dirs = cwdDirs.filter((cwdFile) => (cwdFile.isDir)).map((cwdFile) => (cwdFile.filePath));
		let files = {};
		cwdDirs.forEach((cwdFile) => {
			const isInSelectedDir = dirs.some((dir) => {
				return cwdFile.filePath !== dir && cwdFile.filePath.startsWith(dir);
			});
			if (!isInSelectedDir) {
				if (!files.hasOwnProperty(cwdFile.cwd)) {
					files[cwdFile.cwd] = [];
				}
				files[cwdFile.cwd].push(cwdFile.filePath);
			}
		});
		return files;
	},

	/**
	 * Get the paths of the context target
	 * @param  {EventTarget} target The context target
	 * @return {string[]} The selected paths for the target
	 */
	getPaths(target) {
		const treeView = target.closest(".tree-view");
		if (treeView) {
			// called from treeview
			const selected = treeView.querySelectorAll(".selected > .list-item > .name, .selected > .name");
			if (selected.length > 0) {
				return [].map.call(selected, (el) => {
					return el.dataset.path;
				});
			}
		} else {
			const tab = target.closest(".texteditor.tab");
			if (tab) {
				// called from tab
				return [tab.querySelector(".title").dataset.path];
			} else if (target.getModel && target.getModel().getPath) {
				return [target.getModel().getPath()];
			}
		}

		return [];
	},

	/**
	 * Get cwds of filePaths
	 * @param  {string} filePaths The files to check
	 * @return {Promise.all} Will resolve to object[] {cwd, isDir, filePath}
	 */
	getDirectories(filePaths) {
		return Promise.all(filePaths.map((filePath) => {
			return new Promise((resolve) => {
				fs.stat(filePath, (err, stats) => {
					if (err) {
						throw err;
					}

					let cwd;
					const isDir = stats.isDirectory();

					if (isDir) {
						cwd = filePath;
					} else {
						cwd = path.dirname(filePath);
					}

					resolve({
						cwd,
						isDir,
						filePath
					});
					// FIXME: what about symlink, etc.
				});
			});
		}));
	},

};
