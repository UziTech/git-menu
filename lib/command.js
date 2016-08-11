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

/**
 * Get files associated with context target
 * @param  {HTMLElement} target The context target
 * @return {Promise} Resolves to [files, root]
 */
function getFiles(target) {
	const filePaths = getPaths(target);

	if (filePaths.length === 0) {
		atom.notifications.addError("Context Git", {
			detail: "No files selected."
		});
		return;
	}

	// get directory for path
	let cwdFiles, cwds, root;
	return getDirectories(filePaths)
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
				// TODO: should we be able to handle this instead of throwing an error?
			}
			root = roots[0];

			// get status of git files for path
			return Promise.all(cwds.map((cwd) => (git.status(cwd, cwdFiles[cwd]))));
		})
		.then(statuses => {

			// flatten statuses
			const files = statuses.reduce((prev, el) => (prev.concat(el)), []);
			// if (files.length === 0) {
			// 	throw "No files selected.";
			// }

			// return [files, root] to command
			return [files, root];
		});
}

function onSuccess() {
	return function (message) {
		atom.notifications.addSuccess("Context Git", {
			detail: message
		});
	};
}

function onFailure() {
	return function (err) {
		const message = (err && err.stack ? err.stack : err.toString());
		atom.notifications.addFatalError("Context Git", {
			detail: message,
			dismissable: true
		});
	};
}

function onFinish(root, statusBar) {
	return function () {
		refreshAtom(root);
		statusBar.hide();
	};
}

module.exports = {

	/**
	 * Commit clicked
	 * @param  {CustomEvent} event Command Event
	 * @param  {StatusBarManager} statusBar The status bar
	 * @return {Promise} A promise
	 */
	commit(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			return git.lastCommit(root)
				.then(lastCommit => {
					return new dialog().activate(files, lastCommit);
				})
				.then(([
								message,
								amend,
								push,
								selectedFiles
							]) => {

					// commit files
					statusBar.setProgress();
					statusBar.setLabel("Committing...");
					statusBar.show();
					const filePaths = selectedFiles.map(file => path.resolve(root, file));
					const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
					return git.add(root, filePaths)
						.then(_ => git.commit(root, message, amend, filePaths))
						.then(_ => {
							if (push) {
								refreshAtom(root);
								statusBar.setLabel("Pushing...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pushing..."
								});
								return git.push(root).then(_ => numFiles + " committed & pushed");
							}
							return numFiles + " committed";
						});
				})
				.then(onSuccess())
				.catch(onFailure())
				.then(onFinish(root, statusBar));
		});
	},

	/**
	 * Commit All clicked
	 * @param  {CustomEvent} event Command Event
	 * @param  {StatusBarManager} statusBar The status bar
	 * @return {Promise} A promise
	 */
	commitAll(event, statusBar){
		// FIXME: this is almost all copied code. I should find a way to reuse existing code.

			const filePaths = atom.project.getDirectories().map(dir => dir.getPath());

			if (filePaths.length === 0) {
				atom.notifications.addError("Context Git", {
					detail: "No files selected."
				});
				return;
			}

			// get directory for path
			let cwdFiles, cwds, root;
			return getDirectories(filePaths)
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
						// TODO: should we be able to handle this instead of throwing an error?
					}
					root = roots[0];

					// get status of git files for path
					return Promise.all(cwds.map((cwd) => (git.status(cwd, cwdFiles[cwd]))));
				})
				.then(statuses => {

					// flatten statuses
					const files = statuses.reduce((prev, el) => (prev.concat(el)), []);
					// if (files.length === 0) {
					// 	throw "No files selected.";
					// }

					// return [files, root] to command
					return [files, root];
				}).then(([files, root]) => {
			return git.lastCommit(root)
				.then(lastCommit => {
					return new dialog().activate(files, lastCommit);
				})
				.then(([
								message,
								amend,
								push,
								selectedFiles
							]) => {

					// commit files
					statusBar.setProgress();
					statusBar.setLabel("Committing...");
					statusBar.show();
					const filePaths = selectedFiles.map(file => path.resolve(root, file));
					const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
					return git.add(root, filePaths)
						.then(_ => git.commit(root, message, amend, filePaths))
						.then(_ => {
							if (push) {
								refreshAtom(root);
								statusBar.setLabel("Pushing...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pushing..."
								});
								return git.push(root).then(_ => numFiles + " committed & pushed");
							}
							return numFiles + " committed";
						});
				})
				.then(onSuccess())
				.catch(onFailure())
				.then(onFinish(root, statusBar));
		});
	},

	/**
	 * Discard clicked
	 * @param  {CustomEvent} event Command Event
	 * @param  {StatusBarManager} statusBar The status bar
	 * @return {Promise} A promise
	 */
	discard(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			let untrackedFiles = [];
			let trackedFiles = [];

			files.forEach(file => {
				if (file.untracked) {
					untrackedFiles.push(file.file);
				} else {
					trackedFiles.push(file.file);
				}
			});

			// discard files
			statusBar.setProgress();
			statusBar.setLabel("Discarding...");
			statusBar.show();
			return Promise.all([git.clean(root, untrackedFiles), git.checkout(root, trackedFiles)])
				.then(_ => {
					return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded";
				})
				.then(onSuccess())
				.catch(onFailure())
				.then(onFinish(root, statusBar));
		});
	},

	/**
	 * Undo Last Commit clicked
	 * @param  {CustomEvent} event Command Event
	 * @param  {StatusBarManager} statusBar The status bar
	 * @return {Promise} A promise
	 */
	undoLastCommit(event, statusBar){
		return getFiles(event.target).then(([files, root]) => {
					// discard files
					statusBar.setProgress();
					statusBar.setLabel("Reseting...");
					statusBar.show();
					return git.reset(root)
						.then(_ => {
							return "Last commit is reset.";
						})
						.then(onSuccess())
						.catch(onFailure())
						.then(onFinish(root, statusBar));
		});
	}
};
