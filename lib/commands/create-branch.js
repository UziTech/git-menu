/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";
import CreateBranchDialog from "../dialogs/CreateBranchDialog";

export default {
	label: "Create Branch...",
	description: "Create a new branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CreateBranchDialog, title = "Create Branch") {
		const root = await helper.getRoot(filePaths, git);
		await helper.checkGitLock(root);

		const branches = await git.branches(root);
		const [sourceBranch, newBranch, track] = await new dialog({branches, root}).activate();

		statusBar.show("Creating Branch...");

		await helper.checkGitLock(root);
		const results = [];
		results.push(await git.checkoutBranch(root, sourceBranch));

		results.push(await git.createBranch(root, newBranch));
		notifications.addGit(title, results);

		helper.refreshAtom(root);

		let tracking = "";
		if (track) {
			const trackResult = await git.setUpstream(root, "origin", newBranch);
			notifications.addGit(title, trackResult);

			helper.refreshAtom(root);
			tracking = ` and tracking origin/${newBranch}`;
		}

		return {
			title,
			message: `Created ${newBranch} from ${sourceBranch}${tracking}.`,
		};
	}
};
