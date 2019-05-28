/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import {command as push} from "./push";

export default {
	label: "Push All",
	description: "Push all project repos",
	confirm: {
		message: "Are you sure you want to push all projectrepos?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Push All") {
		const pushes = await Promise.all(atom.project.getPaths().map(root => {
			return push(root, statusBar, git, notifications).catch(() => null);
		}));

		const failed = pushes.filter(p => !p);
		let num = "all";
		if (failed.length > 0) {
			num = pushes.length - failed.length;
		}

		return {
			title,
			message: `Pushed ${num} repos.`,
		};
	},
};
