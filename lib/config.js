"use babel";

import commands from "./commands";
import { NotificationsConfig } from "./Notifications";

export default {
	gitPath: {
		type: "string",
		default: "git",
		description: "Path to your git",
		order: 0
	},
	notifications: {
		type: "integer",
		enum: NotificationsConfig.enum,
		default: NotificationsConfig.default,
		order: 1
	},
	contextMenuItems: {
		type: "object",
		order: 2,
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
