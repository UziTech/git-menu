"use babel";

import gitCmd from "../git-cmd";
import Notifications, { isVerbose } from "../Notifications";
import CommitDialog from "../dialogs/CommitDialog";

import { command as commit } from "./commit";

export default {
	label: "Commit All...",
	description: "Commit all files",
	command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog) {
		return commit(atom.project.getPaths(), statusBar, git, notifications, dialog);
	},
};
