"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Push",
	description: "Push to upstream",
	confirm: {
		message: "Are you sure you want to push to upstream?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		const root = await helper.getRoot(filePaths, git);
		if (await helper.gitLockExists(root, git)) {
			return Promise.reject();
		}
		statusBar.show("Pushing...", null);
		const result = await git.push(root, false, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Pushed.";
	},
};
