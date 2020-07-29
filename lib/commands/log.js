/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import LogDialog from "../dialogs/LogDialog";

export default {
	label: "Log",
	description: "Show Git Log",
	// eslint-disable-next-line no-unused-vars
	async command(filePaths, statusBar, git = gitCmd, notifications = null, dialog = LogDialog) {
		const root = await helper.getRoot(filePaths, git);
		const format = atom.config.get("git-menu.logFormat");
		await new dialog({root, gitCmd, format}).activate();
	},
};
