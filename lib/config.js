"use babel";

import commands from "./commands";

export default {
	gitPath: {
		type: "string",
		default: "git",
		description: "Path to your git",
		order: 0
	},
	showContextMenuItems: {
		type: "object",
		order: 1,
		properties: commands.reduce((prev, cmd, idx) => {
			if (cmd.label) {
				prev[cmd.command] = {
					title: cmd.label,
					description: cmd.description,
					type: "boolean",
					default: true,
					order: idx
				};
			}
			return prev;
		}, {})
	}
};
