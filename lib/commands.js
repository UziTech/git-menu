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
 *                                 This function can be asynchronous
 *   command: (required) The asynchronous function to run when the command is called.
 *                       This function will be called with the parameters `filePaths` and `statusBar`.
 * }
 * @type {Object}
 */
const commands = {

	"commit": {
		label: "Commit...",
		description: "Commit selected files",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog) {
			const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
			const lastCommit = await git.lastCommit(root);
			const [
				message,
				amend,
				push,
				pull,
				selectedFiles
			] = await new dialog({ files, lastCommit })
				.activate();

			if (!message) {
				throw "Message cannot be blank.";
			}

			// commit files
			statusBar.show("Committing...", null);
			const selectedFilePaths = selectedFiles.map(file => path.join(root, file));
			const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
			await git.add(root, selectedFilePaths);
			const result = await git.commit(root, message, amend, selectedFilePaths, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			if (pull) {
				await commands["pull-&-push"].command([root], statusBar, git, notifications);
				return numFiles + " committed & pulled & pushed.";
			} else if (push) {
				await commands.push.command([root], statusBar, git, notifications);
				return numFiles + " committed & pushed.";
			}
			return numFiles + " committed.";
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
			detailedMessage: async(filePaths, git = gitCmd) => {
				const root = await helper.getRoot(filePaths, git);
				const lastCommit = await git.lastCommit(root);
				return "You are adding these files:\n" + filePaths.join("\n") + "\n\nTo this commit:\n" + lastCommit;
			}
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const [files, root] = await helper.getRootAndFiles(filePaths, git);
			const lastCommit = await git.lastCommit(root);

			if (lastCommit === null) {
				throw "No commits yet";
			}

			// commit files
			statusBar.show("Committing...", null);
			const numFiles = files.length + " File" + (files.length !== 1 ? "s" : "");
			await git.add(root, files);
			const result = await git.commit(root, lastCommit, true, files, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return numFiles + " committed.";
		},
	},

	"undo-last-commit": {
		label: "Undo Last Commit",
		description: "Undo the last commit and save the current changes",
		confirm: {
			message: "Are you sure you want to undo the last commit?",
			detailedMessage: async(filePaths, git = gitCmd) => {
				const root = await helper.getRoot(filePaths, git);
				const lastCommit = await git.lastCommit(root);
				return "You are undoing the commit:\n" + lastCommit;
			}
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Reseting...", null);
			try {
				const count = await git.countCommits(root);
				let result;
				if (count > 1) {
					result = await git.reset(root, false, 1, isVerbose());
				} else {
					await git.remove(root);
					result = await git.init(root, isVerbose());
				}
				notifications.addGit(result);
				helper.refreshAtom(root);
				return "Last commit is reset.";
			} catch (error) {
				if (!error) {
					throw "Unknown Error.";
				} else if (error.includes("ambiguous argument")) {
					throw "No commits.";
				}
				throw error;
			}
		},
	},

	"discard-changes": {
		label: "Discard Changes",
		description: "Discard file changes",
		confirm: {
			message: "Are you sure you want to discard all uncommitted changes to these files?",
			detailedMessage: filePaths => "You are discarding changes to:\n" + filePaths.join("\n")
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
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
			const results = await Promise.all([
				(untrackedFiles.length > 0 ? git.clean(root, untrackedFiles, isVerbose()) : ""),
				(trackedFiles.length > 0 ? git.checkoutFiles(root, trackedFiles, isVerbose()) : "")
			]);
			let result = results.filter(i => i)
				.join("\n\n");
			notifications.addGit(result);
			helper.refreshAtom(root);
			return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
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
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Pulling...", null);
			const result = await git.pull(root, false, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Pulled.";
		},
	},

	"push": {
		label: "Push",
		description: "Push to upstream",
		confirm: {
			message: "Are you sure you want to push to upstream?"
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Pushing...", null);
			const result = await git.push(root, false, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Pushed.";
		},
	},

	"pull-&-push": {
		label: "Pull & Push",
		description: "Pull then push from upstream",
		confirm: {
			message: "Are you sure you want to pull then push from upstream?"
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			await commands.pull.command(filePaths, statusBar, git, notifications);
			await commands.push.command(filePaths, statusBar, git, notifications);
			return "Pulled & Pushed";
		},
	},

	"switch-branch": {
		label: "Switch Branch...",
		description: "Checkout a different branch",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = SwitchBranchDialog) {
			const root = await helper.getRoot(filePaths, git);
			const branches = await git.branches(root);
			const [branch] = await new dialog({ branches, root })
				.activate();
			const result = await git.checkoutBranch(root, branch, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Switched to " + branch + ".";
		},
	},

	"create-branch": {
		label: "Create Branch...",
		description: "Create a new branch",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CreateBranchDialog) {
			const root = await helper.getRoot(filePaths, git);
			const branches = await git.branches(root);
			const [sourceBranch, newBranch, track] = await new dialog({ branches, root })
				.activate();
			await git.checkoutBranch(root, sourceBranch);
			const result = await git.createBranch(root, newBranch, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			let tracking = "";
			if (track) {
				const trackResult = await git.setUpstream(root, "origin", newBranch, isVerbose());
				notifications.addGit(trackResult);
				helper.refreshAtom(root);
				tracking = " and tracking origin/" + newBranch;
			}
			return "Created " + newBranch + " from " + sourceBranch + tracking + ".";
		}
	},

	"ignore-changes": {
		label: "Ignore Changes",
		description: "Ignore changes to selected files",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, ignore = true) {
			const [[files, root], statuses] = await Promise.all([
				helper.getRootAndAllFiles(filePaths, git),
				helper.getStatuses(filePaths, git)
			]);

			const trackedFiles = files.filter(file => {
				return !statuses.some(status => {
					return status.untracked && path.resolve(root, status.file) === file;
				});
			});

			statusBar.show((ignore ? "I" : "Uni") + "gnoring...", null);

			const result = await git.updateIndex(root, trackedFiles, ignore, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return trackedFiles.length + " File" + (trackedFiles.length !== 1 ? "s" : "") + " " + (ignore ? "I" : "Uni") + "gnored.";
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
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const roots = atom.project.getPaths()
				.filter(dir => (!!dir && filePaths.some(filePath => filePath.startsWith(dir))));
			if (roots.length === 0) {
				throw "No project directory.";
			}

			statusBar.show("Initializing...", null);
			const results = await Promise.all(roots.map(root => git.init(root, isVerbose())));
			notifications.addGit(results.filter(i => i)
				.join("\n\n"));
			atom.project.setPaths(atom.project.getPaths());
			roots.map(root => { helper.refreshAtom(root); });
			return "Git folder" + (results.length > 1 ? "s" : "") + " initialized.";
		},
	},

	"refresh": {
		label: "Refresh",
		description: "Refresh Atom",
		async command(filePaths, statusBar) {
			statusBar.show("Refreshing...", null);
			await helper.refreshAtom();
			return "Git Refreshed.";
		},
	},

	"fetch": {
		label: "Fetch",
		description: "Fetch from all tracked repos",
		confirm: {
			message: "Are you sure you want to fetch all tracked repos?"
		},
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Fetching...", null);
			const result = await git.fetch(root, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Fetched.";
		}
	},

	"stash-changes": {
		label: "Stash Changes",
		description: "Stash and remove the current changes",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Stashing Changes...", null);
			const result = await git.stash(root, false, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Changes stashed.";
		}
	},

	"unstash-changes": {
		label: "Unstash Changes",
		description: "Restore the changes that were stashed",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
			const root = await helper.getRoot(filePaths, git);
			statusBar.show("Unstashing Changes...", null);
			const result = await git.stash(root, true, isVerbose());
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Changes unstashed.";
		}
	},

	"run-command": {
		label: "Run Command...",
		description: "Run a git command",
		async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = RunCommandDialog) {
			const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
			const [gitCommand, selectedFiles] = await new dialog({ files })
				.activate();
			if (!gitCommand) {
				throw "Command cannot be blank.";
			}
			const trimmedGitCommand = gitCommand.trim()
				.replace(/^git /, "");

			statusBar.show("Running...", null);
			const selectedFilePaths = selectedFiles.map(file => path.join(root, file));
			const numFiles = selectedFiles.length + " file" + (selectedFiles.length !== 1 ? "s" : "");
			let includedFiles = false;
			const gitArgs = stringArgv(trimmedGitCommand)
				.reduce((prev, arg) => {
					if (arg === "%files%") {
						includedFiles = true;
						selectedFilePaths.forEach(file => {
							prev.push(file);
						});
					} else {
						prev.push(arg);
					}
					return prev;
				}, []);

			const result = await git.cmd(root, gitArgs);
			notifications.addGit(result);
			helper.refreshAtom(root);
			return "Ran 'git " + trimmedGitCommand + "'" + (includedFiles ? " with " + numFiles + "." : "");
		}
	},
};

export { commands as default };
