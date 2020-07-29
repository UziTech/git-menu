/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import {command as pull} from "./pull";
import {command as push} from "./push";

export default {
	label: "Sync",
	description: "Pull then push from upstream",
	confirm: {
		message: "Are you sure you want to sync with upstream?",
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Sync") {
		await pull(filePaths, statusBar, git, notifications);
		await push(filePaths, statusBar, git, notifications);
		return {
			title,
			message: "Synced",
		};
	},
};
