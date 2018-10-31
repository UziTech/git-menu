/** @babel */

import {Notification} from "atom";

export const CONFIG_YES = 0;
export const CONFIG_NO = 1;
export const CONFIG_ONLY_ERROR = 2;
export const CONFIG_GIT = 3;
export const CONFIG_GIT_VERBOSE = 4;

export const NotificationsConfig = {
	default: CONFIG_YES,
	enum: [
		{value: CONFIG_YES, description: "Yes"},
		{value: CONFIG_NO, description: "No"},
		{value: CONFIG_ONLY_ERROR, description: "Only Error"},
		{value: CONFIG_GIT, description: "Show Git Output"},
		{value: CONFIG_GIT_VERBOSE, description: "Show Verbose Git Output"},
	]
};

export function isVerbose() {
	return (atom.config.get("git-menu.notifications") === CONFIG_GIT_VERBOSE);
}

export default class Notifications {
	static addNotification(type, title, message, options) {
		switch (atom.config.get("git-menu.notifications")) {
		case CONFIG_NO:
			return;
		case CONFIG_ONLY_ERROR:
			if (type !== "error") {
				return;
			}
			break;
		case CONFIG_GIT:
		case CONFIG_GIT_VERBOSE:
			if (type === "git") {
				// eslint-disable-next-line no-param-reassign
				type = "info";
			} else if (type !== "error") {
				return;
			}
			break;
		case CONFIG_YES:
		default:
			if (type === "git") {
				return;
			}
		}

		if (!title) {
			throw new Error("Notification title must be specified.");
		}

		if (typeof message === "object") {
			// eslint-disable-next-line no-param-reassign
			options = message;
		} else {
			if (typeof options !== "object") {
				// eslint-disable-next-line no-param-reassign
				options = {};
			}
			options.detail = message;
		}

		if (options.detail) {
			atom.notifications.addNotification(new Notification(type, title, options));
		}
	}

	static addSuccess(title, message, options) {
		Notifications.addNotification("success", title, message, options);
	}

	static addError(title, message, options) {

		// default dismissable to true
		if (typeof options !== "object") {
			if (typeof message === "object") {
				if (typeof message.dismissable === "undefined") {
					message.dismissable = true;
				}
			} else {
				// eslint-disable-next-line no-param-reassign
				options = {
					dismissable: true
				};
			}
		} else if (typeof options.dismissable === "undefined") {
			options.dismissable = true;
		}
		Notifications.addNotification("error", title, message, options);
	}

	static addInfo(title, message, options) {
		Notifications.addNotification("info", title, message, options);
	}

	static addGit(title, message, options) {
		if (Array.isArray(message)) {
			// eslint-disable-next-line no-param-reassign
			message = message.filter(m => !!m).join("\n\n");
		}
		if (message !== "") {
			Notifications.addNotification("git", title, message, options);
		}
	}
}
