"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";
import CreateBranchDialog from "../widgets/CreateBranchDialog";

export default {
	label: "Create Branch...",
	description: "Create a new branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CreateBranchDialog) {
		const root = await helper.getRoot(filePaths, git);
		const branches = await git.branches(root);
		const [sourceBranch, newBranch, track] = await new dialog({ branches, root })
			.activate();
		await git.checkoutBranch(root, sourceBranch);
		const result = await git.createBranch(root, newBranch, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		let tracking = "";
		if (track) {
			const trackResult = await git.setUpstream(root, "origin", newBranch, isVerbose());
			notifications.addGit(trackResult);
			helper.refreshAtom(root);
			tracking = " and tracking origin/" + newBranch;
		}
		return "Created " + newBranch + " from " + sourceBranch + tracking + ".";
	}
};
