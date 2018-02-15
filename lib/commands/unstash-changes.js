/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";

import {command as stashChanges} from "./stash-changes";

export default {
	label: "Unstash Changes",
	description: "Restore the changes that were stashed",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Unstash Changes") {
		return stashChanges(filePaths, statusBar, git, notifications, true, title);
	}
};
