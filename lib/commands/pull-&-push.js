"use babel";

import gitCmd from "../git-cmd";
import Notifications, { isVerbose } from "../Notifications";
import { command as pull } from "./pull";
import { command as push } from "./push";

export default {
	label: "Pull & Push",
	description: "Pull then push from upstream",
	confirm: {
		message: "Are you sure you want to pull then push from upstream?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications) {
		await pull(filePaths, statusBar, git, notifications);
		await push(filePaths, statusBar, git, notifications);
		return "Pulled & Pushed";
	},
};
