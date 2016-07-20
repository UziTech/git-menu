"use babel";
/* globals atom */

import {
	CompositeDisposable,
	Disposable,
} from "atom";
import command from "./command";
import StatusBarManager from "./widgets/StatusBarManager";

export default {

	subscriptions: null,

	config: {
		gitPath: {
			type: "string",
			default: "git",
			description: "Path to your git"
		}
	},

	/**
	 * Activate package
	 * @return {void}
	 */
	activate() {
		const self = this;
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.disposables = new CompositeDisposable();

		this.disposables.add(atom.commands.add("atom-workspace", {
			"context-git:commit": (event) => {
				command(event, self.statusBarManager, "commit");
			},
			"context-git:discard": (event) => {
				command(event, self.statusBarManager, "discard");
			}
		}));
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
