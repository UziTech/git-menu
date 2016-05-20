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
				return git.rootDir(cwd);
			})
			.then((dir) => {
				root = dir;
				// get status of git files for path
				return Promise.all([git.status(cwd, filePath), git.lastCommit(cwd)]);
			})
			.then(([files, lastCommit]) => {
				if (files.length === 0) {
					throw "No files to commit";
				}
				// show commit dialog for commit message
				return new Promise((resolve) => {
					new dialog().activate(files, lastCommit, (message, amend, files) => {
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
				return git.commit(cwd, message, amend, files.map((file) => (path.resolve(root, file))));
			})
			.catch((err) => {
				console.error(err, "stack:", err.stack);
			});
	},

	/**
	 * Get the path of the context target
	 * @param  {EventTarget} target The context target
	 * @return {string|null} The path for the target
	 */
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

	/**
	 * Get directory of file
	 * @param  {string} filePath The file to check
	 * @return {string} The directory of the file or the filePath if it is a directory
	 */
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

};
