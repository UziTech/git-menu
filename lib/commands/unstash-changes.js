"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Unstash Changes",
	description: "Restore the changes that were stashed",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		const root = await helper.getRoot(filePaths, git);
		if (await helper.gitLockExists(root, git)) {
			return Promise.reject();
		}
		statusBar.show("Unstashing Changes...", null);
		const result = await git.stash(root, true, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Changes unstashed.";
	}
};
