/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Stash Changes",
	description: "Stash and remove the current changes",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, unstash = false, title = "Stash Changes") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show(`${unstash ? "Uns" : "S"}tashing Changes...`, null);
		const result = await git.stash(root, unstash);
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		return {
			title,
			message: `Changes ${unstash ? "un" : ""}stashed.`,
		};
	}
};
