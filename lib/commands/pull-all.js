/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import {command as pull} from "./pull";

export default {
	label: "Pull All",
	description: "Pull all project repos",
	confirm: {
		message: "Are you sure you want to pull all project repos?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Pull All") {
		const pulls = await Promise.all(atom.project.getPaths().map(root => {
			return pull([root], statusBar, git, notifications).catch(() => null);
		}));

		const failed = pulls.filter(p => !p);
		let num = "all";
		if (failed.length > 0) {
			num = pulls.length - failed.length;
		}

		return {
			title,
			message: `Pulled ${num} repos.`,
		};
	},
};
