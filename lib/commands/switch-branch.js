"use babel";

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";
import SwitchBranchDialog from "../dialogs/SwitchBranchDialog";

export default {
	label: "Switch Branch...",
	description: "Checkout a different branch",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = SwitchBranchDialog) {
		const root = await helper.getRoot(filePaths, git);
		const branches = await git.branches(root);
		const [branch] = await new dialog({ branches, root })
			.activate();
		const result = await git.checkoutBranch(root, branch, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		return "Switched to " + branch + ".";
	},
};
