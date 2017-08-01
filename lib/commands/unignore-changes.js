"use babel";

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";

import { command as ignoreChanges } from "./ignore-changes";

export default {
	label: "Unignore Changes",
	description: "Unignore changes to selected files",
	command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Unignore Changes") {
		return ignoreChanges(filePaths, statusBar, git, notifications, false, title);
	},
};
