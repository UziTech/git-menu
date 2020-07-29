/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import {command as sync} from "./sync";

export default {
	label: "Sync All",
	description: "Pull then push all project repos",
	confirm: {
		message: "Are you sure you want to sync all project repos?",
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Sync All") {
		const syncs = await Promise.all(atom.project.getPaths().map(root => {
			return sync([root], statusBar, git, notifications).catch((err) => {
				const message = (err.stack ? err.stack : err.toString());
				notifications.addError("Git Menu: Sync", `${root}\n\n${message}`);
				return null;
			});
		}));

		const failed = syncs.filter(p => !p);
		let num = "all";
		if (failed.length > 0) {
			num = syncs.length - failed.length;
		}

		return {
			title,
			message: `Synced ${num} repos.`,
		};
	},
};
