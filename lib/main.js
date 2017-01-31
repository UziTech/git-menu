"use babel";
/* globals atom */

import {
	CompositeDisposable,
	Disposable,
} from "atom";
import command from "./command";
import commands from "./commands";
import config from "./config";
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

		commands.forEach((cmd) => {
			// add command
			this.disposables.add(atom.commands.add("atom-workspace", "context-git:" + cmd.command, (event) => {
				command(event, this.statusBarManager, cmd.command);
			}));

			if (cmd.label) {
				// add to context menu
				this.disposables.add(atom.config.observe("context-git.showContextMenuItems." + cmd.command, (value) => {
					if (value) {
						this.contextMenuDisposables[cmd.command] = atom.contextMenu.add({
							".tree-view, .tab-bar > .tab, atom-pane.active": [{
								"label": "Git",
								"submenu": [{
									"label": cmd.label.replace("&", "&&"),
									"command": "context-git:" + cmd.command
								}]
							}]
						});
						this.disposables.add(this.contextMenuDisposables[cmd.command]);
					} else {
						if (this.contextMenuDisposables[cmd.command]) {
							this.disposables.remove(this.contextMenuDisposables[cmd.command]);
							this.contextMenuDisposables[cmd.command].dispose();
							delete this.contextMenuDisposables[cmd.command];
						}
					}
				}));
			}
		});
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
