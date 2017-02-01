"use babel";
/* globals atom */

import helper from "./helper";
import path from "path";
import git from "./git-cmd";
import commitDialog from "./widgets/commit-dialog";
import switchBranchDialog from "./widgets/switch-branch-dialog";

const commands = {

	"commit": {
		label: "Commit...",
		description: "Commit selected files",
		command(filePaths, statusBar) {
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
							.then(_ => git.commit(root, lastCommit, true, files))
							.then(_ => {
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
				return Promise.all([git.clean(root, untrackedFiles), git.checkoutFiles(root, trackedFiles)])
					.then(_ => {
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
				return git.pull(root)
					.then(_ => {
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
				return git.push(root)
					.then(_ => {
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
	},

	"switch-branch": {
		label: "Switch Branch",
		description: "Checkout a different branch",
		command(filePaths, statusBar) {
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

				return git.updateIndex(root, trackedFiles, ignore)
					.then(_ => {
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
			return git.init(root)
				.then(_ => {
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
