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
		properties: Object.keys(commands).reduce((prev, cmd, idx) => {
			if (commands[cmd].label) {
				prev[cmd] = {
					title: commands[cmd].label,
					description: commands[cmd].description,
					type: "boolean",
					default: true,
					order: idx
				};
			}
			return prev;
		}, {})
	}
};
