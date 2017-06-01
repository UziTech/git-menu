"use babel";
/* globals atom */

import path from "path";
import gitCmd from "./git-cmd";
import helper from "./helper";
import Notifications, { isVerbose } from "./Notifications";
import CommitDialog from "./widgets/CommitDialog";
import SwitchBranchDialog from "./widgets/SwitchBranchDialog";
import CreateBranchDialog from "./widgets/CreateBranchDialog";
import RunCommandDialog from "./widgets/RunCommandDialog";
import stringArgv from "string-argv";

/**
 * These commands will be added to the context menu in the order they appear here.
 * They can include the following properties:
 * {
 *   label: (required) The text to display on the context menu item
 *   description: (optional) A description that will be displayed by the enable/disable setting
 *   keymap: (optional) A key combination to add as a default keybinding
 *   confirm: (optional) If the command requires a confirm dialog you can supply the `message` and `detailedMessage` parameters
 *     message: (required) This is the question you are asking the user to confirm.
 *     detailedMessage: (optional) This is where you can provide a more detailed list of the changes.
 *                                 This can be a string or a function that will be called with the `filePaths` parameter that returns a string
 *   command: (required) The function to run when the command is called.
 *                       This function will be called with the parameters `filePaths` and `statusBar`.
 * }
 * @type {Object}
 */
const commands = {

	"commit": {
		label: "Commit...",
		description: "Commit selected files",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog) {
			return helper.getRootAndFilesStatuses(filePaths, git).then(([files, root]) => {
				return git.lastCommit(root)
					.then(lastCommit => new dialog({ files, lastCommit }).activate())
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
						const filePaths = selectedFiles.map(file => path.join(root, file));
						const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
						return git.add(root, filePaths)
							.then(_ => git.commit(root, message, amend, filePaths, isVerbose()))
							.then(result => {
								notifications.addGit(result);
								helper.refreshAtom(root);
								if (pull) {
									return commands["pull-&-push"].command([root], statusBar, git, notifications)
										.then(_ => numFiles + " committed & pulled & pushed.");
								} else if (push) {
									return commands.push.command([root], statusBar, git, notifications)
										.then(_ => numFiles + " committed & pushed.");
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
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog) {
			return commands.commit.command(atom.project.getPaths(), statusBar, git, notifications, dialog);
		},
	},

	"add-to-last-commit": {
		label: "Add To Last Commit",
		description: "Ammend the last commit with the changes",
		confirm: {
			message: "Are you sure you want to add these changes to the last commit?",
			detailedMessage: filePaths => "You are commiting these files:\n" + filePaths.join("\n")
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRootAndFiles(filePaths, git).then(([files, root]) => {
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
								notifications.addGit(result);
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
		confirm: {
			message: "Are you sure you want to undo the last commit?",
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
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
							notifications.addGit(result);
							helper.refreshAtom(root);
							return "Last commit is reset.";
						});
					})
					.catch(error => {
						if (!error) {
							return Promise.reject("Unknown Error.");
						} else if (error.includes("ambiguous argument")) {
							return Promise.reject("No commits.");
						}
						return Promise.reject(error);
					});
			});
		},
	},

	"discard-changes": {
		label: "Discard Changes",
		description: "Discard file changes",
		confirm: {
			message: "Are you sure you want to discard all uncommitted changes to these files?",
			detailedMessage: filePaths => "You are discarding changes to:\n" + filePaths.join("\n")
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRootAndFilesStatuses(filePaths, git).then(([files, root]) => {
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
				return Promise.all([
						(untrackedFiles.length > 0 ? git.clean(root, untrackedFiles, isVerbose()) : ""),
						(trackedFiles.length > 0 ? git.checkoutFiles(root, trackedFiles, isVerbose()) : "")
				])
					.then(([cleanResult, checkoutResult]) => {
						let result = "";
						if (cleanResult && checkoutResult) {
							result = cleanResult + "\n\n" + checkoutResult;
						} else if (cleanResult) {
							result = cleanResult;
						} else if (checkoutResult) {
							result = checkoutResult;
						}
						notifications.addGit(result);
						helper.refreshAtom(root);
						return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
					});
			});
		},
	},

	"discard-all-changes": {
		label: "Discard All Changes",
		description: "Discard all changes",
		confirm: {
			message: "Are you sure you want to discard all uncommitted changes to all files in this repo?",
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return commands["discard-changes"].command(atom.project.getPaths(), statusBar, git, notifications);
		},
	},

	"pull": {
		label: "Pull",
		description: "Pull from upstream",
		confirm: {
			message: "Are you sure you want to pull from upstream?"
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
				statusBar.show("Pulling...", null);
				return git.pull(root, false, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return "Pulled.";
					});
			});
		},
	},

	"push": {
		label: "Push",
		description: "Push to upstream",
		confirm: {
			message: "Are you sure you want to push to upstream?"
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
				statusBar.show("Pushing...", null);
				return git.push(root, false, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return "Pushed.";
					});
			});
		},
	},

	"pull-&-push": {
		label: "Pull & Push",
		description: "Pull then push from upstream",
		confirm: {
			message: "Are you sure you want to pull then push from upstream?"
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return commands.pull.command(filePaths, statusBar, git, notifications)
				.then(_ => commands.push.command(filePaths, statusBar, git, notifications))
				.then(_ => "Pulled & Pushed");
		},
	},

	"switch-branch": {
		label: "Switch Branch...",
		description: "Checkout a different branch",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = SwitchBranchDialog) {
			return helper.getRoot(filePaths, git).then(root => {
				return git.branches(root)
					.then(branches => {
						return new dialog({ branches, root }).activate();
					})
					.then(([branch]) => {
						return git.checkoutBranch(root, branch, isVerbose())
							.then(result => {
								notifications.addGit(result);
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
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CreateBranchDialog) {
			return helper.getRoot(filePaths, git).then(root => {
				return git.branches(root)
					.then(branches => {
						return new dialog({ branches, root }).activate();
					})
					.then(([sourceBranch, newBranch, track]) => {
						return git.checkoutBranch(root, sourceBranch)
							.then(_ => git.createBranch(root, newBranch, isVerbose()))
							.then(result => {
								notifications.addGit(result);
								helper.refreshAtom(root);
								if (track) {
									return git.setUpstream(root, "origin", newBranch, isVerbose())
										.then(result => {
											notifications.addGit(result);
											helper.refreshAtom(root);
											return "Created " + newBranch + " from " + sourceBranch + " and tracking origin/" + newBranch + ".";
										});
								}
								return "Created " + newBranch + " from " + sourceBranch + ".";
							});
					});
			});
		}
	},

	"ignore-changes": {
		label: "Ignore Changes",
		description: "Ignore changes to selected files",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, ignore = true) {
			return Promise.all([helper.getRootAndAllFiles(filePaths, git), helper.getStatuses(filePaths, git)]).then(([[files, root], statuses]) => {

				const trackedFiles = files.filter(file => {
					return !statuses.some(status => {
						return status.untracked && path.resolve(root, status.file) === file;
					});
				});

				statusBar.show((ignore ? "I" : "Uni") + "gnoring...", null);

				return git.updateIndex(root, trackedFiles, ignore, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return trackedFiles.length + " File" + (trackedFiles.length !== 1 ? "s" : "") + " " + (ignore ? "I" : "Uni") + "gnored.";
					});
			});
		},
	},

	"unignore-changes": {
		label: "Unignore Changes",
		description: "Unignore changes to selected files",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return commands["ignore-changes"].command(filePaths, statusBar, git, notifications, false);
		},
	},

	"init": {
		label: "Initialize",
		description: "Inizialize a git repo",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const roots = atom.project.getPaths().filter(dir => (!!dir && filePaths.some(filePath => filePath.startsWith(dir))));
			if (roots.length === 0) {
				return Promise.reject("No project directory.");
			}

			statusBar.show("Initializing...", null);
			return Promise.all(roots.map(root => git.init(root, isVerbose())))
				.then(results => {
					notifications.addGit(results.join("\n\n"));
					atom.project.setPaths(atom.project.getPaths());
					roots.map(root => { helper.refreshAtom(root); });
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

	"fetch": {
		label: "Fetch",
		description: "Fetch from all tracked repos",
		confirm: {
			message: "Are you sure you want to fetch all tracked repos?"
		},
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
				statusBar.show("Fetching...", null);
				return git.fetch(root, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return "Fetched.";
					});
			});
		}
	},

	"stash-changes": {
		label: "Stash Changes",
		description: "Stash and remove the current changes",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
				statusBar.show("Stashing Changes...", null);
				return git.stash(root, false, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return "Changes stashed.";
					});
			});
		}
	},

	"unstash-changes": {
		label: "Unstash Changes",
		description: "Restore the changes that were stashed",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			return helper.getRoot(filePaths, git).then(root => {
				statusBar.show("Unstashing Changes...", null);
				return git.stash(root, true, isVerbose())
					.then(result => {
						notifications.addGit(result);
						helper.refreshAtom(root);
						return "Changes unstashed.";
					});
			});
		}
	},

	"run-command": {
		label: "Run Command...",
		description: "Run a git command",
		command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = RunCommandDialog) {
			return helper.getRootAndFilesStatuses(filePaths, git).then(([files, root]) => {
				return new dialog({ files }).activate()
					.then(([
								gitCommand,
								selectedFiles
							]) => {

						if (!gitCommand) {
							return Promise.reject("Command cannot be blank.");
						}
						gitCommand = gitCommand.trim().replace(/^git /, "");

						statusBar.show("Running...", null);
						const filePaths = selectedFiles.map(file => path.join(root, file));
						const numFiles = selectedFiles.length + " file" + (selectedFiles.length !== 1 ? "s" : "");
						let includedFiles = false;
						const gitArgs = stringArgv(gitCommand).reduce((prev, arg) => {
							if (arg === "%files%") {
								includedFiles = true;
								filePaths.forEach(file => {
									prev.push(file);
								});
							} else {
								prev.push(arg);
							}
							return prev;
						}, []);

						return git.cmd(root, gitArgs)
							.then(result => {
								notifications.addGit(result);
								helper.refreshAtom(root);
								return "Ran 'git " + gitCommand + "'" + (includedFiles ? " with " + numFiles + "." : "");
							});
					});
			});
		}
	},
};

export { commands as default };
