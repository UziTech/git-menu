/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Discard Changes",
	description: "Discard file changes",
	confirm: {
		message: "Are you sure you want to discard all uncommitted changes to these files?",
		detail: filePaths => `You are discarding changes to:\n${filePaths.join("\n")}`,
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Discard Changes") {
		const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
		await helper.checkGitLock(root);

		let results = [];
		results.push(await git.unstage(root));

		let {untrackedFiles, trackedFiles} = files.reduce((prev, file) => {
			if (file.untracked) {
				prev.untrackedFiles.push(file.file);
			} else {
				prev.trackedFiles.push(file.file);
			}
			return prev;
		}, {untrackedFiles: [], trackedFiles: []});

		const allFiles = (await helper.getStatuses([root], git)).reduce((prev, file) => {
			if (file.untracked) {
				prev.untracked.push(file.file);
			} else {
				prev.tracked.push(file.file);
			}
			return prev;
		}, {untracked: [], tracked: []});

		const hasUntrackedFiles = (untrackedFiles.length > 0 && allFiles.untracked.length > 0);
		const hasTrackedFiles = (trackedFiles.length > 0 && allFiles.tracked.length > 0);

		untrackedFiles = helper.reduceFilesToCommonFolders(untrackedFiles, allFiles.untracked);
		trackedFiles = helper.reduceFilesToCommonFolders(trackedFiles, allFiles.tracked);

		statusBar.show("Discarding...");

		// discard files
		results = results.concat(await Promise.all([
			(hasUntrackedFiles ? git.clean(root, untrackedFiles) : ""),
			(hasTrackedFiles ? git.checkoutFiles(root, trackedFiles) : ""),
		]));
		notifications.addGit(title, results);
		helper.refreshAtom(root);
		return {
			title,
			message: `${files.length} File${files.length !== 1 ? "s" : ""} Discarded.`,
		};
	},
};
