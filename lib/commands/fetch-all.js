/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import {command as fetch} from "./fetch";

export default {
	label: "Fetch All",
	description: "Fetch all project repos",
	confirm: {
		message: "Are you sure you want to fetch all project repos?"
	},
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, title = "Fetch All") {
		const fetches = await Promise.all(atom.project.getPaths().map(root => {
			return fetch([root], statusBar, git, notifications).catch((err) => {
				const message = (err.stack ? err.stack : err.toString());
				notifications.addError("Context Git: Fetch", `${root}\n\n${message}`);
				return null;
			});
		}));

		const failed = fetches.filter(p => !p);
		let num = "all";
		if (failed.length > 0) {
			num = fetches.length - failed.length;
		}

		return {
			title,
			message: `Fetched ${num} repos.`,
		};
	}
};
