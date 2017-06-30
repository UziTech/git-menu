"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Stash Changes",
	description: "Stash and remove the current changes",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		const root = await helper.getRoot(filePaths, git);
		if (await helper.gitLockExists(root, git)) {
			return Promise.reject();
		}
		statusBar.show("Stashing Changes...", null);
		const result = await git.stash(root, false, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Changes stashed.";
	}
};
