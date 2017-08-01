"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";
import DeleteBranchDialog from "../dialogs/DeleteBranchDialog";

export default {
	label: "Delete Branch...",
	description: "Delete a branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = DeleteBranchDialog, title = "Delete Branch") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);

		const branches = await git.branches(root);
		const [branch, remote, force] = await new dialog({ branches, root }).activate();

		statusBar.show("Deleting Branch...", null);

		const isCurrentBranch = branches.reduce((prev, b) => {
			return (prev || (b.name === branch && b.selected));
		}, false);
		await helper.checkGitLock(root);
		if (isCurrentBranch) {
			// if branch is current branch then checkout master first?
			await git.checkoutBranch(root, "master");
		}

		const result = await git.deleteBranch(root, branch, false, force, isVerbose());
		notifications.addGit(title, result);

		helper.refreshAtom(root);

		if (remote) {
			const result = await git.deleteBranch(root, branch, true, force, isVerbose());
			notifications.addGit(title, result);

			helper.refreshAtom(root);
		}

		return "Deleted branch " + branch + ".";
	},
};
