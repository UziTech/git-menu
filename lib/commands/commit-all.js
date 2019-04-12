/** @babel */

import gitCmd from "../git-cmd";
import Notifications from "../Notifications";
import CommitDialog from "../dialogs/CommitDialog";

import {command as commit} from "./commit";

export default {
	label: "Commit All...",
	description: "Commit all files",
	command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog, title = "Commit All") {
		// only get paths that are parents of filePaths files
		const paths = atom.project.getPaths().map(root => {
			const r = root.toLowerCase().replace(/\\/g, "/");
			const hasPath = filePaths.some(file => {
				const p = file.toLowerCase().replace(/\\/g, "/");
				return p.indexOf(r) === 0;
			});
			return hasPath ? root : false;
		}).filter(r => r);

		return commit(paths, statusBar, git, notifications, dialog, title);
	},
};
