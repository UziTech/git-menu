"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Pull",
	description: "Pull from upstream",
	confirm: {
		message: "Are you sure you want to pull from upstream?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		const root = await helper.getRoot(filePaths, git);
		if (await helper.gitLockExists(root, git)) {
			return Promise.reject();
		}
		statusBar.show("Pulling...", null);
		const result = await git.pull(root, false, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Pulled.";
	},
};
