/** @babel */

import {
	CompositeDisposable,
	Disposable,
} from "atom";
import commands from "./commands";
import config from "./config";
import helper from "./helper";
import StatusBarManager from "./widgets/StatusBarManager";
import Notifications from "./Notifications";
import {promisify} from "promisificator";

export default {
	config,

	/**
	 * Activate package
	 * @return {void}
	 */
	activate() {
		this.updateConfig();

		this.disposables = new CompositeDisposable();
		this.contextMenuDisposables = {};
		this.confirmationDialogs = {};
		this.context = null;

		this.statusBarManager = new StatusBarManager();
		this.disposables.add(new Disposable(() => {
			this.statusBarManager.destroy();
			this.statusBarManager = null;
		}));

		for (const command in commands) {
			const cmd = commands[command];

			// observe confirm dialog settings
			if (cmd.confirm) {
				this.disposables.add(atom.config.observe(`git-menu.confirmationDialogs.${command}`, value => {
					this.confirmationDialogs[command] = value;
				}));
			} else {
				this.confirmationDialogs[command] = false;
			}

			// add command
			this.disposables.add(atom.commands.add("atom-workspace", `context-git:${command}`, {
				didDispatch: (event) => {
					Notifications.addError("Deprecated Command", "'context-git:*' commands are deprecated. Please use 'git-menu:*' instead.");
					return this.dispatchCommand(command, cmd)(event);
				},
				hiddenInCommandPalette: true,
			}));
			this.disposables.add(atom.commands.add("atom-workspace", `git-menu:${command}`, this.dispatchCommand(command, cmd)));

			if (cmd.label) {
				// add to context menu
				this.disposables.add(atom.config.observe(`git-menu.contextMenuItems.${command}`, value => {
					if (value) {
						this.contextMenuDisposables[command] = atom.contextMenu.add({
							"atom-workspace, atom-text-editor, .tree-view, .tab-bar": [{
								label: "Git",
								submenu: [{
									label: cmd.label.replace("&", "&&"),
									command: `git-menu:${command}`,
								}],
							}],
						});
						this.disposables.add(this.contextMenuDisposables[command]);
					} else {
						if (this.contextMenuDisposables[command]) {
							this.contextMenuDisposables[command].dispose();
						}
					}
				}));
			}

			if (cmd.keymap) {
				// add key binding
				atom.keymaps.add("git-menu", {
					"atom-workspace": {
						[cmd.keymap]: `git-menu:${command}`
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
	 * Copy config from context-git to git-menu
	 * @return {void}
	 */
	updateConfig() {
		try {
			const hasGitMenuConfig = "git-menu" in atom.config.settings;
			const hasContextGitConfig = "context-git" in atom.config.settings;
			if (hasGitMenuConfig || !hasContextGitConfig) {
				return;
			}

			const contextGitConfig = atom.config.getAll("context-git");
			contextGitConfig.forEach((cfg) => {
				let {scopeSelector} = cfg;
				if (scopeSelector === "*") {
					scopeSelector = null;
				}
				for (const key in cfg.value) {
					const value = cfg.value[key];
					atom.config.set(`git-menu.${key}`, value, {scopeSelector});
				}
			});
		} catch (ex) {
			// fail silently
		}
	},

	/**
	 * Consume the status bar service
	 * @param  {object} statusBar Status bar service
	 * @return {void}
	 */
	statusBarService(statusBar) {
		if (this.statusBarManager) {
			this.statusBarManager.addStatusBar(statusBar);
		}
	},

	/**
	 * Consume the busy signal service
	 * @param  {object} busySignal Busy signal service
	 * @return {void}
	 */
	busySignalService(busySignal) {
		if (this.statusBarManager) {
			this.statusBarManager.addBusySignal(busySignal);
		}
	},

	/**
	 * Consume the context service
	 * @param  {object} context Context service
	 * @return {void}
	 */
	contextService(context) {
		console.log("in context");
		this.context = context.getContext("git-menu");
		this.disposables.add(this.context);

		console.dir("Context:", this.context);

		for (const command in commands) {
			const cmd = commands[command];

			if (this.contextMenuDisposables[command]) {
				this.contextMenuDisposables[command].dispose();
			}

			// TODO: remove other observers?

			// eslint-disable-next-line no-loop-func
			this.disposables.add(atom.config.observe(`git-menu.contextMenuItems.${command}`, value => {
				if (value) {
					this.contextMenuDisposables[command] = context.addMenuItem({
						keyPath: `Git.${cmd.label.replace("&", "&&")}`,
						command: `git-menu:${command}`,
					});
					this.disposables.add(this.contextMenuDisposables[command]);
				} else {
					if (this.contextMenuDisposables[command]) {
						this.contextMenuDisposables[command].dispose();
					}
				}
			}));
		}
	},

	/**
	 * Dispatch a command
	 * @param  {string} command Command name
	 * @param  {object} cmd The command object
	 * @return {function} Async function to call for command
	 */
	dispatchCommand(command, cmd) {
		return async event => {
			try {
				this.statusBarManager.show(cmd.label, {revealTooltip: false});
				const filePaths = this.context ? this.context.filesForEvent(event) : helper.getPaths(event.target);

				// show confirm dialog if applicable
				if (this.confirmationDialogs[command]) {
					const {message} = cmd.confirm;
					let {detail} = cmd.confirm;
					if (typeof detail === "function") {
						detail = await detail(filePaths);
					}

					const [confirmButton, hideDialog] = await promisify(atom.confirm.bind(atom), {rejectOnError: false, alwaysReturnArray: true})({
						type: "warning",
						checkboxLabel: "Never Show This Dialog Again",
						message,
						detail,
						buttons: [
							cmd.label,
							"Cancel",
						]
					});

					if (hideDialog) {
						atom.config.set(`git-menu.confirmationDialogs.${command}`, false);
					}
					if (confirmButton === 1) {
						return;
					}
				}

				try {
					// run command
					const {title, message} = await cmd.command(filePaths, this.statusBarManager);
					if (message) {
						Notifications.addSuccess(title, message);
					}
				} catch (err) {
					if (err) {
						const message = (err.stack ? err.stack : err.toString());
						Notifications.addError(`Context Git: ${cmd.label}`, message);
					}
				}
			} finally {
				this.statusBarManager.hide();
			}
		};
	},
};
