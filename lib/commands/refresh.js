"use babel";

import helper from "../helper";

export default {
	label: "Refresh",
	description: "Refresh Atom",
	async command(filePaths, statusBar) {
		statusBar.show("Refreshing...", null);
		await helper.refreshAtom();
		return "Git Refreshed.";
	},
};
