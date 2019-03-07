/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

export default {
	label: "Stage Changes",
	description: "Stage the changes to commit later",
	confirm: {
		message: "Are you sure you want to stage these changes?",
		detail: (filePaths) => {
			return `You are staging these files:\n${filePaths.join("\n")}`;
		}
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Stage Changes") {
		const [files, root] = await helper.getRootAndFiles(filePaths, git);
		await helper.checkGitLock(root);

		// commit files
		statusBar.show("Staging...");
		const numFiles = `${files.length} File${files.length !== 1 ? "s" : ""}`;
		const results = await git.add(root, files);
		notifications.addGit(title, results);
		helper.refreshAtom(root);
		return {
			title,
			message: `${numFiles} staged.`,
		};
	},
};
