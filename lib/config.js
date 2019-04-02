/** @babel */

import commands from "./commands";
import {NotificationsConfig} from "./Notifications";

export default {
	gitPath: {
		type: "string",
		default: "git",
		description: "Path to your git executable",
		order: 0
	},
	notifications: {
		type: "integer",
		enum: NotificationsConfig.enum,
		default: NotificationsConfig.default,
		order: 1
	},
	logFormat: {
		type: "string",
		title: "Default Log Format",
		description: "(see https://git-scm.com/docs/git-log#_pretty_formats)",
		default: "medium",
		order: 2,
	},
	treeView: {
		type: "boolean",
		title: "Tree View",
		description: "Show files as tree view",
		default: true,
		order: 3,
	},
	confirmationDialogs: {
		type: "object",
		order: 4,
		properties: Object.keys(commands).reduce((prev, cmd, idx) => {
			if (commands[cmd].confirm) {
				const label = commands[cmd].label || commands[cmd].confirm.label;
				prev[cmd] = {
					title: label,
					description: `Show confirmation dialog on ${label}`,
					type: "boolean",
					default: true,
					order: idx
				};
			}
			return prev;
		}, {
			deleteRemote: {
				title: "Delete Remote",
				description: "Show confirmation dialog when deleting a remote branch",
				type: "boolean",
				default: true,
				order: Object.keys(commands).length
			},
			deleteAfterMerge: {
				title: "Delete After Merge",
				description: "Show confirmation dialog when deleting a branch after merging",
				type: "boolean",
				default: true,
				order: Object.keys(commands).length + 1
			},
		})
	},
	contextMenuItems: {
		type: "object",
		order: 5,
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
