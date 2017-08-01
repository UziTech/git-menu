"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Unstash Changes",
	description: "Restore the changes that were stashed",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Unstash Changes") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show("Unstashing Changes...", null);
		const result = await git.stash(root, true, isVerbose());
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		return "Changes unstashed.";
	}
};
