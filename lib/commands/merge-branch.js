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
		const [rootBranch, mergeBranch, rebase, deleteBranch, abort] = await new dialog({branches, root}).activate();

		if (rootBranch.name === mergeBranch.name) {
			throw "Branches cannot be the same.";
		}

		statusBar.show("Merging Branch...");

		await helper.checkGitLock(root);

		const gitResults = [];
		if (!rootBranch.selected) {
			// if rootBranch is not current branch then checkout rootBranch first
			gitResults.push(await git.checkoutBranch(root, rootBranch.name));

			helper.refreshAtom(root);
		}

		try {
			gitResults.push(
				rebase
					? await git.rebase(root, mergeBranch.name)
					: await git.merge(root, mergeBranch.name)
			);
		} catch (ex) {
			notifications.addGit(title, gitResults);
			if (abort) {
				await git.abort(root, !rebase);
				throw `Merge aborted:\n\n${ex}`;
			} else {
				throw ex;
			}
		} finally {
			helper.refreshAtom(root);
		}


		if (deleteBranch) {
			gitResults.push(await git.deleteBranch(root, mergeBranch.name));

			helper.refreshAtom(root);
		}

		notifications.addGit(title, gitResults);

		return {
			title,
			message: `Merged branch ${mergeBranch.name} into ${rootBranch.name}.`,
		};
	},
};
