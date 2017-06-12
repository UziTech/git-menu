"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
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
};
