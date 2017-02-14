"use babel";
/* globals atom */

import path from "path";
import git from "./git-cmd";
import helper from "./helper";
import Notifications, { isVerbose } from "./Notifications";
import CommitDialog from "./widgets/commit-dialog";
import SwitchBranchDialog from "./widgets/switch-branch-dialog";
import CreateBranchDialog from "./widgets/create-branch-dialog";

/**
 * These commands will be added to the context menu in the order they appear here.
 * They can include the following properties:
 * {
 *   label: (required) The text to display on the context menu item
 *   description: (optional) A description that will be displayed by the enable/disable setting
 *   keymap: (optional) A key combination to add as a default keybinding
 *   command: (required) The function to run when the command is called.
 *                       This function will be called with the parameters `filePaths` and `statusBar`.
 * }
 * @type {Object}
 */
const commands = {

	"commit": {
		label: "Commit...",
		description: "Commit selected files",
		command(filePaths, statusBar) {
			return helper.getRootAndFilesStatuses(filePaths).then(([files, root]) => {
				return git.lastCommit(root)
					.then(lastCommit => {
						return new CommitDialog().activate(files, lastCommit);
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
							.then(_ => git.commit(root, message, amend, filePaths, isVerbose()))
							.then(result => {
								Notifications.addGit(result);
								helper.refreshAtom(root);
								if (pull) {
									statusBar.setLabel("Pulling...");
									Notifications.addInfo("Pulling...");
									return git.pull(root, isVerbose()).then(result => {
										Notifications.addGit(result);
										helper.refreshAtom(root);
										statusBar.setLabel("Pushing...");
										Notifications.addInfo("Pushing...");
										return git.push(root, isVerbose()).then(result => {
											Notifications.addGit(result);
											helper.refreshAtom(root);
											return numFiles + " committed & pulled & pushed.";
										});
									});
								} else if (push) {
									statusBar.setLabel("Pushing...");
									Notifications.addInfo("Pushing...");
									return git.push(root, isVerbose()).then(result => {
										Notifications.addGit(result);
										helper.refreshAtom(root);
										return numFiles + " committed & pushed.";
									});
								}
								return numFiles + " committed.";
							});
					});
			});
		},
	},

	"commit-all": {
		label: "Commit All...",
		description: "Commit all files",
		command(filePaths, statusBar) {
			return commands.commit.command(atom.project.getPaths(), statusBar);
		},
	},

	"add-to-last-commit": {
		label: "Add To Last Commit",
		description: "Ammend the last commit with the changes",
		command(filePaths, statusBar) {
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
							.then(_ => git.commit(root, lastCommit, true, files, isVerbose()))
							.then(result => {
								Notifications.addGit(result);
								helper.refreshAtom(root);
								return numFiles + " committed.";
							});
					});
			});
		},
	},

	"undo-last-commit": {
		label: "Undo Last Commit",
		description: "Undo the last commit and save the current changes",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				statusBar.show("Reseting...", null);
				return git.countCommits(root)
					.then(count => {
						let resetPromise;
						if (count > 1) {
							resetPromise = git.reset(root, false, 1, isVerbose());
						} else {
							resetPromise = git.remove(root)
								.then(_ => {
									return git.init(root, isVerbose());
								});
						}
						return resetPromise.then(result => {
							Notifications.addGit(result);
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
	},

	"discard-changes": {
		label: "Discard Changes",
		description: "Discard file changes",
		command(filePaths, statusBar) {
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
				return Promise.all([git.clean(root, untrackedFiles, isVerbose()), git.checkoutFiles(root, trackedFiles, isVerbose())])
					.then(([cleanResult, checkoutResult]) => {
						let result = "";
						if (cleanResult && checkoutResult) {
							result = cleanResult + "\n\n" + checkoutResult;
						} else if (cleanResult) {
							result = cleanResult;
						} else if (checkoutResult) {
							result = checkoutResult;
						}
						Notifications.addGit(result);
						helper.refreshAtom(root);
						return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
					});
			});
		},
	},

	"discard-all-changes": {
		label: "Discard All Changes",
		description: "Discard all changes",
		command(filePaths, statusBar) {
			return commands["discard-changes"].command(atom.project.getPaths(), statusBar);
		},
	},

	"pull": {
		label: "Pull",
		description: "Pull from upstream",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				statusBar.show("Pulling...", null);
				return git.pull(root, isVerbose())
					.then(result => {
						Notifications.addGit(result);
						helper.refreshAtom(root);
						return "Pulled.";
					});
			});
		},
	},

	"push": {
		label: "Push",
		description: "Push to upstream",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				statusBar.show("Pushing...", null);
				return git.push(root, isVerbose())
					.then(result => {
						Notifications.addGit(result);
						helper.refreshAtom(root);
						return "Pushed.";
					});
			});
		},
	},

	"pull-&-push": {
		label: "Pull & Push",
		description: "Pull then push from upstream",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				statusBar.show("Pulling...", null);
				return git.pull(root, isVerbose())
					.then(result => {
						Notifications.addGit(result);
						helper.refreshAtom(root);
						statusBar.show("Pushing...", null);
						return git.push(root, isVerbose())
							.then(result => {
								Notifications.addGit(result);
								helper.refreshAtom(root);
								return "Pulled & Pushed.";
							});
					});
			});
		},
	},

	"switch-branch": {
		label: "Switch Branch...",
		description: "Checkout a different branch",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				return git.branches(root)
					.then(branches => {
						return new SwitchBranchDialog().activate(branches, root);
					})
					.then(branch => {
						return git.checkoutBranch(root, branch, isVerbose())
							.then(result => {
								Notifications.addGit(result);
								helper.refreshAtom(root);
								return "Switched to " + branch + ".";
							});
					});
			});
		},
	},

	"create-branch": {
		label: "Create Branch...",
		description: "Create a new branch",
		command(filePaths, statusBar) {
			return helper.getRoot(filePaths).then(root => {
				return git.branches(root)
					.then(branches => {
						return new CreateBranchDialog({branches, root}).activate();
					})
					.then(([sourceBranch, newBranch, track]) => {
						return git.checkoutBranch(root, sourceBranch)
							.then(_ => git.createBranch(root, newBranch, (track ? "origin/" + newBranch : false), isVerbose()))
							.then(result => {
								Notifications.addGit(result);
								helper.refreshAtom(root);
								return "Created " + newBranch + " from " + sourceBranch + ".";
							});
					});
			});
		}
	},

	"ignore-changes": {
		label: "Ignore Changes",
		description: "Ignore changes to selected files",
		command(filePaths, statusBar, ignore = true) {
			return Promise.all([helper.getRootAndAllFiles(filePaths), helper.getStatuses(filePaths)]).then(([[files, root], statuses]) => {

				const trackedFiles = files.filter(file => {
					return !statuses.some(status => {
						return status.untracked && path.resolve(root, status.file) === file;
					});
				});

				statusBar.show((ignore ? "I" : "Uni") + "gnoring...", null);

				return git.updateIndex(root, trackedFiles, ignore, isVerbose())
					.then(result => {
						Notifications.addGit(result);
						helper.refreshAtom(root);
						return trackedFiles.length + " File" + (trackedFiles.length !== 1 ? "s" : "") + " " + (ignore ? "I" : "Uni") + "gnored.";
					});
			});
		},
	},

	"unignore-changes": {
		label: "Unignore Changes",
		description: "Unignore changes to selected files",
		command(filePaths, statusBar) {
			return commands["ignore-changes"].command(filePaths, statusBar, false);
		},
	},

	"init": {
		label: "Initialize",
		description: "Inizialize a git repo",
		command(filePaths, statusBar) {
			const dirs = atom.project.getPaths();
			if (dirs.length === 0) {
				throw "No root directory.";
			} else if (dirs.length > 1) {
				throw "Too many root directories in project.";
				// TODO: should be able to handle this with filePaths
			}

			const root = dirs[0];

			statusBar.show("Initializing...", null);
			return git.init(root, isVerbose())
				.then(result => {
					Notifications.addGit(result);
					atom.project.setPaths(atom.project.getPaths());
					helper.refreshAtom(root);
					return "Git folder initialized.";
				});
		},
	},

	"refresh": {
		label: "Refresh",
		description: "Refresh Atom",
		command(filePaths, statusBar) {
			statusBar.show("Refreshing...", null);
			return helper.refreshAtom().then(_ => "Git Refreshed.");
		},
	},
};

export { commands as default };
