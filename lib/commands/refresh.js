/** @babel */

import helper from "../helper";

export default {
	label: "Refresh",
	description: "Refresh Atom",
	async command(filePaths, statusBar, title = "Refresh") {
		statusBar.show("Refreshing...", null);
		await helper.refreshAtom();
		return {
			title,
			message: "Git Refreshed.",
		};
	},
};
