/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Pull",
	description: "Pull from upstream",
	confirm: {
		message: "Are you sure you want to pull from upstream?",
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Pull") {
		const root = await helper.getRoot(filePaths, git);
		const rebase = atom.config.get("git-menu.rebaseOnPull");
		await helper.checkGitLock(root);
		statusBar.show("Pulling...");
		const result = await git.pull(root, rebase, false);
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		return {
			title,
			message: "Pulled.",
		};
	},
};
