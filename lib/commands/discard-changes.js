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
		await helper.checkGitLock(root, git);

		let { untrackedFiles, trackedFiles } = files.reduce((prev, file) => {
			if (file.untracked) {
				prev.untrackedFiles.push(file.file);
			} else {
				prev.trackedFiles.push(file.file);
			}
			return prev;
		}, { untrackedFiles: [], trackedFiles: [] });

		const allFiles = (await helper.getStatuses([root], git)).reduce((prev, file) => {
			if (file.untracked) {
				prev.untracked.push(file.file);
			} else {
				prev.tracked.push(file.file);
			}
			return prev;
		}, { untracked: [], tracked: [] });

		const hasUntrackedFiles = allFiles.untracked.length > 0;
		const hasTrackedFiles = allFiles.tracked.length > 0;

		untrackedFiles = helper.reduceFilesToCommonFolders(untrackedFiles, allFiles.untracked);
		trackedFiles = helper.reduceFilesToCommonFolders(trackedFiles, allFiles.tracked);

		statusBar.show("Discarding...", null);

		// discard files
		const results = await Promise.all([
			(hasUntrackedFiles ? git.clean(root, untrackedFiles, isVerbose()) : ""),
			(hasTrackedFiles ? git.checkoutFiles(root, trackedFiles, isVerbose()) : "")
		]);
		let result = results.filter(i => i)
			.join("\n\n");
		notifications.addGit(result);
		helper.refreshAtom(root);
		return files.length + " File" + (files.length !== 1 ? "s" : "") + " Discarded.";
	},
};
