"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";
import DeleteBranchDialog from "../dialogs/DeleteBranchDialog";

export default {
	label: "Delete Branch...",
	description: "Delete a branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = DeleteBranchDialog) {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root, git);
		const branches = await git.branches(root);
		const [branch, force] = await new dialog({ branches, root }).activate();
		// TODO: if branch is current branch then checkout master first?
		await helper.checkGitLock(root, git);
		const result = await git.deleteBranch(root, branch, force, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Deleted branch " + branch + ".";
	},
};
