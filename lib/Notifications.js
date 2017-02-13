"use babel";
/* globals atom */

import { Notification } from "atom";

export const CONFIG_YES = 0;
export const CONFIG_NO = 1;
export const CONFIG_ONLY_ERROR = 2;
export const CONFIG_GIT = 3;
export const CONFIG_GIT_VERBOSE = 4;

export const NotificationsConfig = {
	default: CONFIG_YES,
	enum: [
		{ value: CONFIG_YES, description: "Yes" },
		{ value: CONFIG_NO, description: "No" },
		{ value: CONFIG_ONLY_ERROR, description: "Only Error" },
		{ value: CONFIG_GIT, description: "Show Git Output" },
		{ value: CONFIG_GIT_VERBOSE, description: "Show Verbose Git Output" },
	]
};

export function isVerbose() {
	return (atom.config.get("context-git.notifications") === CONFIG_GIT_VERBOSE);
}

export default class Notifications {
	static addNotification(type, message, options) {
		switch (atom.config.get("context-git.notifications")) {
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

		if (typeof message === "object") {
			options = message;
		} else {
			if (typeof options !== "object") {
				options = {};
			}
			options.detail = message;
		}

		if (options.detail) {
			atom.notifications.addNotification(new Notification(type, "Context Git", options));
		}
	}

	static addSuccess(message, options) {
		Notifications.addNotification("success", message, options);
	}

	static addError(message, options) {
		if (typeof options !== "object") {
			if (typeof message === "object") {
				if (typeof message.dismissable === "undefined") {
					message.dismissable = true;
				}
			} else {
				options = {
					dismissable: true
				};
			}
		} else if (typeof options.dismissable === "undefined") {
			options.dismissable = true;
		}
		Notifications.addNotification("error", message, options);
	}

	static addInfo(message, options) {
		Notifications.addNotification("info", message, options);
	}

	static addGit(message, options) {
		if (message !== "") {
			this.addNotification("git", message, options);
		}
	}
}
