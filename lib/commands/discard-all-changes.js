"use babel";

import gitCmd from "../git-cmd";
import Notifications, { isVerbose } from "../Notifications";

import { command as discardChanges } from "./discard-changes";

export default {
	label: "Discard All Changes",
	description: "Discard all changes",
	confirm: {
		message: "Are you sure you want to discard all uncommitted changes to all files in this repo?",
	},
	command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		return discardChanges(atom.project.getPaths(), statusBar, git, notifications);
	},
};
