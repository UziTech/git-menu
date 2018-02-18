/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import LogDialog from "../dialogs/LogDialog";

export default {
	label: "Log",
	description: "Show Git Log",
	async command(filePaths, statusBar, git = gitCmd, notifications = null, dialog = LogDialog) {
		const root = await helper.getRoot(filePaths, git);
		const format = atom.config.get("context-git.logFormat");
		await new dialog({root, gitCmd, format}).activate();
		return Promise.reject();
	}
};
