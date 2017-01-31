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
import commitDialog from "./widgets/commit-dialog";
import switchBranchDialog from "./widgets/switch-branch-dialog";

/**
 * Remove selected files where a parent folder is also selected and group by parent folder.
 * @param  {Object[]} cwdDirs The result of getDirectories()
 * @return {Object} Keys will be cwds and values will be an array of files for that cwd
 */
function consolidateFiles(cwdDirs) {
	let dirs = cwdDirs.filter(cwdFile => cwdFile.isDir).map(cwdFile => cwdFile.filePath);
	let files = {};
	cwdDirs.forEach(cwdFile => {
		const isInSelectedDir = dirs.some(dir => (cwdFile.filePath !== dir && cwdFile.filePath.startsWith(dir)));
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
	if (!target) {
		return atom.project.getPaths();
	}

	const treeView = target.closest(".tree-view");
	if (treeView) {
		// called from treeview
		const selected = treeView.querySelectorAll(".selected > .list-item > .name, .selected > .name");
		if (selected.length > 0) {
			return [].map.call(selected, el => el.dataset.path);
		}
		return [];
	}

	const tab = target.closest(".tab-bar > .tab");
	if (tab) {
		// called from tab
		return [tab.querySelector(".title").dataset.path];
	}

	const pane = target.closest("atom-pane");
	if (pane && pane.dataset.activeItemPath) {
		// called from active pane
		return [pane.dataset.activeItemPath];
	}

	return [];
}

/**
 * Get cwds of filePaths
 * @param  {string[]} filePaths The files to check
 * @return {Promise} {Object[]} Will resolve to {cwd, isDir, filePath}
 */
function getDirectories(filePaths) {
	return Promise.all(filePaths.map(filePath => {
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
			});
		});
	}));
}

/**
 * Get a list of unsaved files
 * @param {string[]} filePaths The file paths to check for unsaved
 * @return {string[]} Unsaved files;
 */
function getUnsavedFiles(filePaths) {
	const unsavedTabs = document.querySelectorAll(".tab-bar > .tab.modified > .title");
	const unsavedFiles = [].map.call(unsavedTabs, el => el.dataset.path);
	return unsavedFiles.filter(file => (!!file && filePaths.some(filePath => file.startsWith(filePath))));
}

/**
 * Refresh Atom git repositories
 * @param {string|string[]} root Root directory(s) of the repo(s)
 * @return {Promise} {void}
 */
function refreshAtom(root) {
	if (typeof root === "undefined") {
		root = atom.project.getDirectories().map(dir => dir.getPath());
	}
	if (!Array.isArray(root)) {
		root = [root];
	}
	return Promise.all(root.map(dir => {
		atom.project.repositoryForDirectory(new Directory(dir)).then(repo => {
			repo.refreshStatus();
		});
	}));
}

/**
 * Get files inside directory
 * @param  {string} dir The file paths to look for files
 * @return {Promise} {string[]} The list of files in directory
 */
function getFilesInDir(dir) {
	return new Promise((resolve, reject) => {
		fs.stat(dir, (err, stats) => {
			if (err) {
				return reject(err);
			}

			if (stats.isDirectory()) {
				fs.readdir(dir, (err, filePaths) => {
					if (err) {
						return reject(err);
					}

					Promise.all(filePaths.map(filePath => getFilesInDir(path.resolve(dir, filePath)))).then(files => {
						resolve(files.reduce((prev, file) => prev.concat(file), []));
					}, reject);
				});
			} else {
				resolve([dir]);
			}
		});
	});
}

/**
 * Get file statuses
 * @param  {string[]} filePaths A list of file/folder paths
 * @return {Promise} {Object[]} The file statuses
 */
function getStatuses(filePaths) {
	return getDirectories(filePaths)
		.then(cwdDirs => {
			// remove duplicates
			const cwdFiles = consolidateFiles(cwdDirs);
			const cwds = Object.keys(cwdFiles);

			return Promise.all(cwds.map(cwd => git.status(cwd, cwdFiles[cwd])));
		})
		.then((statuses) => {
			// flatten statuses
			return statuses.reduce((prev, status) => prev.concat(status), []);
		});
}

/**
 * Get the git root directory
 * @param  {string[]} filePaths A list of file/folder paths
 * @return {Promise} {string} The root directory
 */
function getRoot(filePaths) {
	return getDirectories(filePaths)
		.then(cwdDirs => {

			// remove duplicates
			const cwdFiles = consolidateFiles(cwdDirs);

			return Promise.all(Object.keys(cwdFiles).map(cwd => git.rootDir(cwd)));
		})
		.then(rootDirs => {
			// remove duplicates
			const roots = [...new Set(rootDirs)];
			if (roots.length > 1) {
				throw "Selected files are not in the same repository";
				// TODO: should we be able to handle this instead of throwing an error?
			}
			return roots[0];
		});
}

/**
 * Get all files associated with context files
 * @param  {string[]} filePaths The context files
 * @return {Promise} {[string[], string]} Resolves to [files, root]
 */
function getRootAndAllFiles(filePaths) {

	const getFiles = Promise.all(filePaths.map(filePath => getFilesInDir(filePath)))
		.then(files => {
			const allFiles = files.reduce((prev, file) => prev.concat(file), []);
			return [...new Set(allFiles)];
		});

	return Promise.all([getFiles, getRoot(filePaths)]);
}

/**
 * Get files git statuses associated with context files
 * @param  {string[]} filePaths The context files
 * @return {Promise} {[Object[], string]} Resolves to [files, root]
 */
function getRootAndFilesStatuses(filePaths) {

	if (getUnsavedFiles(filePaths).length > 0) {
		return Promise.reject("Save files before running git.");
	}

	return Promise.all([getStatuses(filePaths), getRoot(filePaths)]);
}

function getRootAndFiles(filePaths) {
	return getRootAndFilesStatuses(filePaths).then(([statuses, root]) => {
		const files = statuses.map(file => file.file);
		return [files, root];
	});
}

/**
 * Returns a function that accepts a message and will be executed after a command is successful
 * @return {function} function to execute after a command is successful
 */
function onSuccess() {
	return message => {
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
	return err => {
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
	return _ => {
		statusBar.hide();
	};
}

/**
 * These commands all take the context files and statusBar and return a promise that resolves to a success message or an error.
 * @type {Promise}
 */
const commands = {

	"refresh" (filePaths, statusBar) {
		statusBar.show("Refreshing...", null);
		return refreshAtom().then(_ => "Git Refreshed.");
	},

	"init" (filePaths, statusBar) {
		const dirs = atom.project.getPaths();
		if (dirs.length === 0) {
			throw "No root directory.";
		} else if (dirs.length > 1) {
			throw "Too many root directories in project.";
			// TODO: should be able to handle this with filePaths
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

	"commit" (filePaths, statusBar) {
		return getRootAndFilesStatuses(filePaths).then(([files, root]) => {
			return git.lastCommit(root)
				.then(lastCommit => {
					return new commitDialog().activate(files, lastCommit);
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

	"commit-all" (filePaths, statusBar) {
		return commands.commit(atom.project.getPaths(), statusBar);
	},

	"discard-changes" (filePaths, statusBar) {
		return getRootAndFilesStatuses(filePaths).then(([files, root]) => {
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
			return Promise.all([git.clean(root, untrackedFiles), git.checkoutFiles(root, trackedFiles)])
				.then(_ => {
					refreshAtom(root);
					return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
				});
		});
	},

	"discard-all-changes" (filePaths, statusBar) {
		return commands.discardChanges(atom.project.getPaths(), statusBar);
	},

	"add-to-last-commit" (filePaths, statusBar) {
		return getRootAndFiles(filePaths).then(([files, root]) => {
			return git.lastCommit(root)
				.then(lastCommit => {

					if (lastCommit === null) {
						return Promise.reject("No commits yet");
					}

					// commit files
					statusBar.show("Committing...", null);
					const numFiles = files.length + " File" + (files.length !== 1 ? "s" : "");
					return git.add(root, files)
						.then(_ => git.commit(root, lastCommit, true, files))
						.then(_ => {
							refreshAtom(root);
							return numFiles + " committed.";
						});
				});
		});
	},

	"undo-last-commit" (filePaths, statusBar) {
		return getRoot(filePaths).then(root => {
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

	"pull" (filePaths, statusBar) {
		return getRoot(filePaths).then(root => {
			statusBar.show("Pulling...", null);
			return git.pull(root)
				.then(_ => {
					refreshAtom(root);
					return "Pulled.";
				});
		});
	},

	"push" (filePaths, statusBar) {
		return getRoot(filePaths).then(root => {
			statusBar.show("Pushing...", null);
			return git.push(root)
				.then(_ => {
					refreshAtom(root);
					return "Pushed.";
				});
		});
	},

	"pull-&-push" (filePaths, statusBar) {
		return getRoot(filePaths).then(root => {
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

	"switch-branch" (filePaths, statusBar) {
		return getRoot(filePaths).then(root => {
			return git.branches(root)
				.then(branches => {
					return new switchBranchDialog().activate(branches, root);
				})
				.then(branch => {
					return git.checkoutBranch(root, branch)
						.then(result => {
							refreshAtom(root);
							return "Switched to " + branch + ".";
						});
				});
		});
	},

	"ignore-changes" (filePaths, statusBar, ignore = true) {
		return getRootAndAllFiles(filePaths).then(([files, root]) => {

			statusBar.show((ignore ? "I" : "Uni") + "gnoring...", null);

			return git.updateIndex(root, files, ignore)
				.then(_ => {
					refreshAtom(root);
					return files.length + " File" + (files.length !== 1 ? "s" : "") + " " + (ignore ? "I" : "Uni") + "gnored.";
				});
		});
	},

	"unignore-changes" (filePaths, statusBar) {
		return commands["ignore-changes"](filePaths, statusBar, false);
	},
};

export default (event, statusBar, command) => {
	if (typeof commands[command] !== "function") {
		throw `'${command}' is not a valid command`;
	}
	const filePaths = getPaths(event.target);
	commands[command](filePaths, statusBar)
		.then(onSuccess())
		.catch(onFailure())
		.then(onFinish(statusBar));
};
