/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Push",
	description: "Push to upstream",
	confirm: {
		message: "Are you sure you want to push to upstream?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Push") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show("Pushing...");
		const result = await git.push(root, false);
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		return {
			title,
			message: "Pushed.",
		};
	},
};
