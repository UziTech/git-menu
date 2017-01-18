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
import checkoutDialog from "./widgets/checkout-dialog";
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
			return [].map.call(selected, el => el.dataset.path);
		}
		return [];
	}

	const tab = target.closest(".texteditor.tab");
	if (tab) {
		// called from tab
		return [tab.querySelector(".title").dataset.path];
	}

	const editor = target.closest("atom-text-editor");
	if (editor) {
		// called from editor
		return [editor.getModel().getPath()];
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
		return new Promise((resolve, reject) => {
			fs.stat(filePath, (err, stats) => {
				if (err) {
					return reject(err);
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
 * Get a list of unsaved files
 * @return {string[]} Array of unsaved files;
 */
function getUnsavedFiles() {
	const unsavedTabs = document.querySelectorAll("li[is='tabs-tab'].modified > .title");
	return [].map.call(unsavedTabs, el => el.dataset.path);
}

/**
 * Refresh Atom git repositories
 * @param {string|string[]} root Root directory(s) of the repo(s)
 * @return {Promise} {void}
 */
function refreshAtom(root) {
	if (typeof root === "undefined") {
		root = atom.project.getDirectories().map(function (dir) {
			return dir.getPath();
		});
	}
	if (!Array.isArray(root)) {
		root = [root];
	}
	return Promise.all(root.map(function (dir) {
		atom.project.repositoryForDirectory(new Directory(dir)).then(repo => {
			repo.refreshStatus();
		});
	}));
}

function filesInFilePaths(filePaths, files) {
	return files.filter(function (file) {
		return filePaths.some(function (filePath) {
			return file.startsWith(filePath);
		});
	});
}

/**
 * Get files associated with context target
 * @param  {HTMLElement} target The context target
 * @return {Promise} Resolves to [files, root]
 */
function getFiles(target) {
	let filePaths = [];
	if (target) {
		filePaths = getPaths(target);
	}

	if (filePaths.length === 0) {
		filePaths = atom.project.getPaths();
	}

	const unsavedFiles = getUnsavedFiles();
	if (unsavedFiles.length > 0) {
		console.log("Unsaved Files Exist:", filePaths, unsavedFiles);
		const unsaved = filesInFilePaths(filePaths, unsavedFiles);
		if (unsaved.length > 0) {
			return Promise.reject("Save files before running git.");
		}
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

/**
 * Returns a function that accepts a message and will be executed after a command is successful
 * @return {function} function to execute after a command is successful
 */
function onSuccess() {
	return function (message) {
		atom.notifications.addSuccess("Context Git", {
			detail: message
		});
	};
}

/**
 * Returns a function that accepts an Error and will be executed after a command fails
 * @return {function} function to execute after a command fails
 */
function onFailure() {
	return function (err) {
		if (err) {
			const message = (err && err.stack ? err.stack : err.toString());
			atom.notifications.addError("Context Git", {
				detail: message,
				dismissable: true
			});
		}
	};
}

/**
 * Returns a function will be executed after a command is complete
 * @param {StatusBarManager} statusBar statusBar
 * @return {function} function to execute after a command is complete
 */
function onFinish(statusBar) {
	return function () {
		statusBar.hide();
	};
}

/**
 * These commands all take an event and statusBar and return a promise that resolves to a success message or an error.
 * @type {Object}
 */
const commands = {

	refresh() {
		return refreshAtom().then(function () {
			return "Git Refreshed.";
		});
	},

	init(event, statusBar) {
		const dirs = atom.project.getPaths();
		if (dirs.length === 0) {
			throw "No root directory.";
		} else if (dirs.length > 1) {
			throw "Too many root directories in project.";
			// TODO: should be able to handle this with event.target
		}

		const root = dirs[0];

		statusBar.show("Initializing...", null);
		return git.init(root)
			.then(_ => {
				atom.project.setPaths(atom.project.getPaths());
				refreshAtom(root);
				return "Git folder initialized.";
			});
	},

	commit(event, statusBar) {
		return getFiles(event.target).then(function ([files, root]) {
			return git.lastCommit(root)
				.then(lastCommit => {
					return new dialog().activate(files, lastCommit);
				})
				.then(([
								message,
								amend,
								push,
								pull,
								selectedFiles
							]) => {

					if (!message) {
						return Promise.reject("Message cannot be blank.");
					}

					// commit files
					statusBar.show("Committing...", null);
					const filePaths = selectedFiles.map(file => path.resolve(root, file));
					const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
					return git.add(root, filePaths)
						.then(_ => git.commit(root, message, amend, filePaths))
						.then(_ => {
							refreshAtom(root);
							if (pull) {
								statusBar.setLabel("Pulling...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pulling..."
								});
								return git.pull(root).then(_ => {
									refreshAtom(root);
									statusBar.setLabel("Pushing...");
									atom.notifications.addInfo("Context Git", {
										detail: "Pushing..."
									});
									return git.push(root).then(_ => {
										refreshAtom(root);
										return numFiles + " committed & pulled & pushed.";
									});
								});
							} else if (push) {
								statusBar.setLabel("Pushing...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pushing..."
								});
								return git.push(root).then(_ => {
									refreshAtom(root);
									return numFiles + " committed & pushed.";
								});
							}
							return numFiles + " committed.";
						});
				});
		});
	},

	commitAll(event, statusBar) {
		return commands.commit({ target: null }, statusBar);
	},

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

			statusBar.show("Discarding...", null);

			// discard files
			return Promise.all([git.clean(root, untrackedFiles), git.checkout(root, trackedFiles)])
				.then(_ => {
					refreshAtom(root);
					return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
				});
		});
	},

	amendLastCommit(event, statusBar) {
		return getFiles(event.target).then(function ([files, root]) {
			return git.lastCommit(root)
				.then(lastCommit => {

					if (lastCommit === null) {
						return Promise.reject("No commits yet");
					}

					// commit files
					statusBar.show("Committing...", null);
					const filePaths = files.map(file => file.file);
					const numFiles = files.length + " File" + (files.length !== 1 ? "s" : "");
					return git.add(root, filePaths)
						.then(_ => git.commit(root, lastCommit, true, filePaths))
						.then(_ => {
							refreshAtom(root);
							return numFiles + " committed.";
						});
				});
		});
	},

	undoLastCommit(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			statusBar.show("Reseting...", null);
			return git.countCommits(root)
				.then(count => {
					let resetPromise;
					if (count > 1) {
						resetPromise = git.reset(root);
					} else {
						resetPromise = git.remove(root)
							.then(_ => {
								return git.init(root);
							});
					}
					return resetPromise.then(_ => {
						refreshAtom(root);
						return "Last commit is reset.";
					});
				})
				.catch(error => {
					if (!error) {
						throw "Unknown Error.";
					} else if (error.includes("ambiguous argument")) {
						throw "No commits.";
					} else {
						throw error;
					}
				});
		});
	},

	pull(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			statusBar.show("Pulling...", null);
			return git.pull(root)
				.then(_ => {
					refreshAtom(root);
					return "Pulled.";
				});
		});
	},

	push(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			statusBar.show("Pushing...", null);
			return git.push(root)
				.then(_ => {
					refreshAtom(root);
					return "Pushed.";
				});
		});
	},

	pullPush(event, statusBar) {
		return getFiles(event.target).then(([files, root]) => {
			statusBar.show("Pulling...", null);
			return git.pull(root)
				.then(_ => {
					refreshAtom(root);
					statusBar.show("Pushing...", null);
					return git.push(root)
						.then(_ => {
							refreshAtom(root);
							return "Pulled & Pushed.";
						});
				});
		});
	},

	checkout(event, statusBar){
		return getFiles(event.target).then(([files, root]) => {
			return git.branches(root).then((branches) => {
				return new checkoutDialog().activate(branches)
			})
		});
	}
};

module.exports = function (event, statusBar, command) {
	if (typeof commands[command] !== "function") {
		throw `'${command}' is not a valid command`;
	}
	commands[command](event, statusBar)
		.then(onSuccess())
		.catch(onFailure())
		.then(onFinish(statusBar));
};
