"use babel";

import path from "path";
import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Ignore Changes",
	description: "Ignore changes to selected files",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, ignore = true) {
		const [[files, root], statuses] = await Promise.all([
				helper.getRootAndAllFiles(filePaths, git),
				helper.getStatuses(filePaths, git)
			]);
		await helper.checkGitLock(root);

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
};
