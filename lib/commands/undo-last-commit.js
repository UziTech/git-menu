"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
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
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Undo Last Commit") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show("Resetting...", null);
		try {
			const count = await git.countCommits(root);
			let result;
			if (count > 1) {
				result = await git.reset(root, false, 1, isVerbose());
			} else {
				await git.remove(root);
				result = await git.init(root, isVerbose());
			}
			notifications.addGit(title, result);
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
};
