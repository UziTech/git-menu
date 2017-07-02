"use babel";
/* globals atom */

import {
	CompositeDisposable,
	Disposable,
} from "atom";
import commands from "./commands";
import config from "./config";
import helper from "./helper";
import StatusBarManager from "./widgets/StatusBarManager";
import Notifications from "./Notifications";

export default {
	config,

	/**
	 * Activate package
	 * @return {void}
	 */
	activate() {
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.disposables = new CompositeDisposable();
		this.contextMenuDisposables = {};
		this.confirmationDialogs = {};

		for (let command in commands) {
			const cmd = commands[command];

			// observe confirm dialog settings
			if (cmd.confirm) {
				this.disposables.add(atom.config.observe("context-git.confirmationDialogs." + command, value => {
					this.confirmationDialogs[command] = value;
				}));
			} else {
				this.confirmationDialogs[command] = false;
			}

			// add command
			this.disposables.add(atom.commands.add("atom-workspace", "context-git:" + command, this.dispatchCommand(command, cmd)));

			if (cmd.label) {
				// add to context menu
				this.disposables.add(atom.config.observe("context-git.contextMenuItems." + command, value => {
					if (value) {
						this.contextMenuDisposables[command] = atom.contextMenu.add({
							"atom-text-editor, .tree-view, .tab-bar": [{
								"label": "Git",
								"submenu": [{
									"label": cmd.label.replace("&", "&&"),
									"command": "context-git:" + command
								}]
							}]
						});
						this.disposables.add(this.contextMenuDisposables[command]);
					} else {
						if (this.contextMenuDisposables[command]) {
							this.disposables.remove(this.contextMenuDisposables[command]);
							this.contextMenuDisposables[command].dispose();
							delete this.contextMenuDisposables[command];
						}
					}
				}));
			}

			if (cmd.keymap) {
				// add key binding
				atom.keymaps.add("context-git", {
					"atom-workspace": {
						[cmd.keymap]: "context-git:" + command
					}
				});
			}
		}
	},

	/**
	 * Deactivate package
	 * @return {void}
	 */
	deactivate() {
		this.disposables.dispose();
	},

	/**
	 * Consume the status bar service
	 * @param  {mixed} statusBar Status bar service
	 * @return {void}
	 */
	statusBarService(statusBar) {
		if (!this.statusBarManager) {
			this.statusBarManager = new StatusBarManager(statusBar);
			this.disposables.add(new Disposable(_ => this.statusBarManager.destroy()));
		}
	},

	dispatchCommand(command, cmd) {
		return async event => {
			const filePaths = helper.getPaths(event.target);

			// show confirm dialog if applicable
			if (this.confirmationDialogs[command]) {
				const message = cmd.confirm.message;
				let detailedMessage;
				if (typeof cmd.confirm.detailedMessage === "function") {
					detailedMessage = await cmd.confirm.detailedMessage(filePaths);
				} else {
					detailedMessage = cmd.confirm.detailedMessage;
				}
				const confirm = atom.confirm({
					message,
					detailedMessage,
					buttons: {
						[cmd.label]: _ => true,
						"Never Show This Dialog Again": _ => {
							atom.config.set("context-git.confirmationDialogs." + command, false);
							return true;
						},
						"Cancel": _ => false,
					}
				});
				if (!confirm) {
					return Promise.reject();
				}
			}

			try {
				// run command
				const message = await cmd.command(filePaths, this.statusBarManager);
				Notifications.addSuccess(message);
			} catch (err) {
				if (err) {
					const message = (err.stack ? err.stack : err.toString());
					Notifications.addError(message);
				}
			}

			if (this.statusBarManager) {
				this.statusBarManager.hide();
			}
		};
	},
};
