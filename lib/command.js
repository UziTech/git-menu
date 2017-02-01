"use babel";
/* globals atom */

import helper from "./helper";
import path from "path";
import git from "./git-cmd";
import commitDialog from "./widgets/commit-dialog";
import switchBranchDialog from "./widgets/switch-branch-dialog";

/**
 * These commands all take the context files and statusBar and return a promise that resolves to a success message or an error.
 * @type {Promise}
 */
export const commands = {

	"refresh" (filePaths, statusBar) {
		statusBar.show("Refreshing...", null);
		return helper.refreshAtom().then(_ => "Git Refreshed.");
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
				helper.refreshAtom(root);
				return "Git folder initialized.";
			});
	},

	"commit" (filePaths, statusBar) {
		return helper.getRootAndFilesStatuses(filePaths).then(([files, root]) => {
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
							helper.refreshAtom(root);
							if (pull) {
								statusBar.setLabel("Pulling...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pulling..."
								});
								return git.pull(root).then(_ => {
									helper.refreshAtom(root);
									statusBar.setLabel("Pushing...");
									atom.notifications.addInfo("Context Git", {
										detail: "Pushing..."
									});
									return git.push(root).then(_ => {
										helper.refreshAtom(root);
										return numFiles + " committed & pulled & pushed.";
									});
								});
							} else if (push) {
								statusBar.setLabel("Pushing...");
								atom.notifications.addInfo("Context Git", {
									detail: "Pushing..."
								});
								return git.push(root).then(_ => {
									helper.refreshAtom(root);
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
		return helper.getRootAndFilesStatuses(filePaths).then(([files, root]) => {
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
					helper.refreshAtom(root);
					return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
				});
		});
	},

	"discard-all-changes" (filePaths, statusBar) {
		return commands.discardChanges(atom.project.getPaths(), statusBar);
	},

	"add-to-last-commit" (filePaths, statusBar) {
		return helper.getRootAndFiles(filePaths).then(([files, root]) => {
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
							helper.refreshAtom(root);
							return numFiles + " committed.";
						});
				});
		});
	},

	"undo-last-commit" (filePaths, statusBar) {
		return helper.getRoot(filePaths).then(root => {
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
						helper.refreshAtom(root);
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
		return helper.getRoot(filePaths).then(root => {
			statusBar.show("Pulling...", null);
			return git.pull(root)
				.then(_ => {
					helper.refreshAtom(root);
					return "Pulled.";
				});
		});
	},

	"push" (filePaths, statusBar) {
		return helper.getRoot(filePaths).then(root => {
			statusBar.show("Pushing...", null);
			return git.push(root)
				.then(_ => {
					helper.refreshAtom(root);
					return "Pushed.";
				});
		});
	},

	"pull-&-push" (filePaths, statusBar) {
		return helper.getRoot(filePaths).then(root => {
			statusBar.show("Pulling...", null);
			return git.pull(root)
				.then(_ => {
					helper.refreshAtom(root);
					statusBar.show("Pushing...", null);
					return git.push(root)
						.then(_ => {
							helper.refreshAtom(root);
							return "Pulled & Pushed.";
						});
				});
		});
	},

	"switch-branch" (filePaths, statusBar) {
		return helper.getRoot(filePaths).then(root => {
			return git.branches(root)
				.then(branches => {
					return new switchBranchDialog().activate(branches, root);
				})
				.then(branch => {
					return git.checkoutBranch(root, branch)
						.then(result => {
							helper.refreshAtom(root);
							return "Switched to " + branch + ".";
						});
				});
		});
	},

	"ignore-changes" (filePaths, statusBar, ignore = true) {
		return helper.getRootAndAllFiles(filePaths).then(([files, root]) => {

			statusBar.show((ignore ? "I" : "Uni") + "gnoring...", null);

			return git.updateIndex(root, files, ignore)
				.then(_ => {
					helper.refreshAtom(root);
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
	const filePaths = helper.getPaths(event.target);
	commands[command](filePaths, statusBar)
		.then(message => {
			atom.notifications.addSuccess("Context Git", {
				detail: message
			});
		})
		.catch(err => {
			if (err) {
				const message = (err && err.stack ? err.stack : err.toString());
				atom.notifications.addError("Context Git", {
					detail: message,
					dismissable: true
				});
			}
		})
		.then(_ => {
			statusBar.hide();
		});
};
