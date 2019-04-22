/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";
import DeleteBranchDialog from "../dialogs/DeleteBranchDialog";

export default {
	label: "Delete Branch...",
	description: "Delete a branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = DeleteBranchDialog, title = "Delete Branch") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);

		let branches = await git.branches(root);
		const [branch, local, remote, force] = await new dialog({branches, root}).activate();

		if (!local && !remote) {
			return;
		}

		statusBar.show("Deleting Branch...");

		await helper.checkGitLock(root);
		const results = [];
		if (branch.selected) {
			// if branch is current branch then checkout master first
			if (branch.name === "master") {
				branches = await git.branches(root);
				const br = branches.find(b => !b.selected && b.local);
				if (br) {
					results.push(await git.checkoutBranch(root, br.name));
				}
			} else {
				results.push(await git.checkoutBranch(root, "master"));
			}

			if (results.length > 0) {
				helper.refreshAtom(root);
			}
		}

		if (local) {
			results.push(await git.deleteBranch(root, branch.name, false, force));

			helper.refreshAtom(root);
		}

		if (remote) {
			results.push(await git.deleteBranch(root, branch.name, true, force));

			helper.refreshAtom(root);
		}

		notifications.addGit(title, results);

		return {
			title,
			message: `Deleted branch ${branch.name}.`,
		};
	},
};
