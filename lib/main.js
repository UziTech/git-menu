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

		for (let command in commands) {
			const cmd = commands[command];

			// add command
			this.disposables.add(atom.commands.add("atom-workspace", "context-git:" + command, (event) => {
				const filePaths = helper.getPaths(event.target);
				cmd.command(filePaths, this.statusBarManager)
					.then(message => {
						atom.notifications.addSuccess("Context Git", {
							detail: message
						});
					})
					.catch(err => {
						if (err) {
							const message = (err && err.stack ? err.stack : err.toString());
							atom.notifications.addError("Context Git", {
								detail: message,
								dismissable: true
							});
						}
					})
					.then(_ => {
						this.statusBarManager.hide();
					});
			}));

			if (cmd.label) {
				// add to context menu
				this.disposables.add(atom.config.observe("context-git.showContextMenuItems." + command, (value) => {
					if (value) {
						this.contextMenuDisposables[command] = atom.contextMenu.add({
							".tree-view, .tab-bar > .tab, atom-pane.active": [{
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
};
