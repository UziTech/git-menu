/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Fetch",
	description: "Fetch from all tracked repos",
	confirm: {
		message: "Are you sure you want to fetch all tracked repos?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Fetch") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show("Fetching...");
		const result = await git.fetch(root);
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		return {
			title,
			message: "Fetched.",
		};
	}
};
