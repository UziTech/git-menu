/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";

export default {
	label: "Diff",
	description: "Open diff in a new file",
	async command(filePaths, statusBar, git = gitCmd, title = "Diff") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);

		// commit files
		statusBar.show("Diffing...");
		const result = await git.diff(root, filePaths);

		const textEditor = await atom.workspace.open("untitled.diff");
		textEditor.setText(result);

		return {
			title,
			message: "Diff opened.",
		};
	},
};
