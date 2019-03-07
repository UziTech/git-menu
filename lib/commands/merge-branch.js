/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";
import MergeBranchDialog from "../dialogs/MergeBranchDialog";

export default {
	label: "Merge Branch...",
	description: "Merge a branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = MergeBranchDialog, title = "Merge Branch") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);

		const branches = await git.branches(root, false);
		const [rootBranch, mergeBranch, deleteBranch] = await new dialog({branches, root}).activate();

		if (rootBranch.name === mergeBranch.name) {
			throw "Branches cannot be the same.";
		}

		statusBar.show("Merging Branch...");

		await helper.checkGitLock(root);
		if (!rootBranch.selected) {
			// if rootBranch is not current branch then checkout rootBranch first
			const result = await git.checkoutBranch(root, rootBranch.name);

			if (result !== null) {
				notifications.addGit(title, result);

				helper.refreshAtom(root);
			}
		}

		const mergeResult = await git.merge(root, mergeBranch.name);
		notifications.addGit(title, mergeResult);

		helper.refreshAtom(root);

		if (deleteBranch) {
			const deleteResult = await git.deleteBranch(root, mergeBranch.name);
			notifications.addGit(title, deleteResult);

			helper.refreshAtom(root);
		}

		return {
			title,
			message: `Merged branch ${mergeBranch.name} into ${rootBranch.name}.`,
		};
	},
};
