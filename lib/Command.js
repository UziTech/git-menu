"use babel";
/* globals atom */

import {
	CompositeDisposable,
	Disposable,
	Directory,
} from "atom";
import fs from "fs";
import path from "path";
import git from "./git-cmd";
import dialog from "./widgets/commit-dialog";
// TODO: import dialog from "./dialog.js";


/**
 * Remove selected files where a parent folder is also selected and group by parent folder.
 * @param  {Object[]} cwdDirs The result of getDirectories()
 * @return {Object} Keys will be cwds and values will be an array of files for that cwd
 */
function consolidateFiles(cwdDirs) {
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
}

/**
 * Get the paths of the context target
 * @param  {EventTarget} target The context target
 * @return {string[]} The selected paths for the target
 */
function getPaths(target) {
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
}

/**
 * Get cwds of filePaths
 * @param  {string} filePaths The files to check
 * @return {Promise.all} Will resolve to object[] {cwd, isDir, filePath}
 */
function getDirectories(filePaths) {
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
}

/**
 * Refresh Atom git repositories
 * @param {string} root Root directory of the repo
 * @return {void}
 */
function refreshAtom(root) {
	atom.project.repositoryForDirectory(new Directory(root)).then(repo => repo.refreshStatus());
}

class Command {

	constructor(event, statusBar) {
		// get paths for context
		this.filePaths = getPaths(event.target);
		this.statusBar = statusBar;
	}

	/**
	 * Commit clicked
	 * @param  {MouseEvent} event The mouse click event
	 * @return {void}
	 */
	commit() {
		if (this.filePaths.length === 0) {
			atom.notifications.addError("Context Git", {
				detail: "No files selected."
			});
			return;
		}
		// get directory for path
		let cwdFiles, cwds, root;
		getDirectories(this.filePaths)
			.then((cwdDirs) => {
				// remove duplicates
				cwdFiles = consolidateFiles(cwdDirs);
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
						detail: "No files to commit."
					});
					throw false;
				}
				// show commit dialog for commit message
				return new dialog().activate(status, lastCommit);
			})
			.then(([
				message,
				amend,
				push,
				files
			]) => {
				// commit files
				this.statusBar.setProgress();
				this.statusBar.setLabel("Committing...");
				this.statusBar.show();
				const filePaths = files.map(file => path.resolve(root, file));
				const numFiles = files.length + " File" + (files.length !== 1 ? "s" : "");
				return git.add(root, filePaths)
					.then(_ => git.commit(root, message, amend, filePaths))
					.then(_ => {
						refreshAtom(root);
						if (push) {
							this.statusBar.setLabel("Pushing...");
							atom.notifications.addInfo("Context Git", {
								detail: "Pushing..."
							});
							return git.push(root).then(_ => numFiles + " committed & pushed");
						}
						return numFiles + " committed";
					});
			})
			.then(message => {
				this.statusBar.hide();
				atom.notifications.addSuccess("Context Git", {
					detail: message
				});
			})
			.catch((err) => {
				refreshAtom(root);
				this.statusBar.hide();
				if (err) {
					atom.notifications.addFatalError("Context Git", {
						detail: err.toString() + (err.stack ? "\n" + err.stack : ""),
						dismissable: true
					});
				}
			});
	}
}

module.exports = Command;
