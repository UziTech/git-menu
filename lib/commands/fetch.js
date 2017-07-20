"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

export default {
	label: "Fetch",
	description: "Fetch from all tracked repos",
	confirm: {
		message: "Are you sure you want to fetch all tracked repos?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);
		statusBar.show("Fetching...", null);
		const result = await git.fetch(root, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Fetched.";
	}
};
