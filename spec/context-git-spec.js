"use babel";
/* globals describe, beforeEach, atom, it, expect, waitsForPromise, runs, spyOn, jasmine */

import commands from "../lib/commands";
import config from "../lib/config";
import rimraf from "../lib/rimraf";
import main from "../lib/main";

describe("Context Git", function () {
	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.configOptions = atom.config.getAll("context-git")[0].value;
		this.configConfirmationDialogs = Object.keys(this.configOptions.confirmationDialogs);
		this.configContextMenuItems = Object.keys(this.configOptions.contextMenuItems);
		this.allConfig = Object.keys(this.configOptions);
		this.allCommands = atom.commands
			.findCommands({ target: atom.views.getView(atom.workspace) })
			.map(cmd => cmd.name)
			.filter(cmd => cmd.startsWith("context-git:"));
		this.getContextMenuItems = _ => atom.contextMenu.itemSets
			.filter(itemSet => itemSet.selector === "atom-text-editor, .tree-view, .tab-bar")
			.map(itemSet => itemSet.items[0].submenu[0].command);
		this.confirmSpy = spyOn(atom, "confirm");
	});

	describe("Config", function () {
		Object.keys(config)
			.forEach(configOption => {
				it("has a config option: " + configOption, function () {
					expect(this.allConfig)
						.toContain(configOption);
				});
			});
	});

	describe("Commands", function () {
		Object.keys(commands)
			.forEach(command => {
				const cmd = "context-git:" + command;
				const label = commands[command].label;
				const confirm = commands[command].confirm;
				const description = commands[command].description;
				const func = commands[command].command;
				const dispatch = main.dispatchCommand(command, commands[command]);
				describe(command, function () {
					beforeEach(function () {
						this.cmdSpy = spyOn(commands[command], "command")
							.and.returnValue(Promise.reject());
					});
					it("should have a command in the command pallete", function () {
						expect(this.allCommands)
							.toContain(cmd);
					});
					it("should have a command", function () {
						expect(func)
							.toEqual(jasmine.any(Function));
					});
					if (label) {
						it("should have a config option to disable it in the context menu", function () {
							expect(this.configContextMenuItems)
								.toContain(command);
						});
						it("should have a description", function () {
							expect(description)
								.toBeTruthy();
						});
						it("should have a context menu item", function () {
							expect(this.getContextMenuItems())
								.toContain(cmd);
						});
						it("should not have a context menu item when unchecked", function () {
							atom.config.set("context-git.contextMenuItems." + command, false);
							expect(this.getContextMenuItems())
								.not.toContain(cmd);
						});
					} else {
						it("should not have a config option to disable it in the context menu", function () {
							expect(this.configContextMenuItems)
								.not.toContain(command);
						});
						it("should not have a context menu item", function () {
							expect(this.getContextMenuItems())
								.not.toContain(cmd);
						});
					}

					if (confirm) {
						it("should have a config option to disable the confirm dialog", function () {
							expect(this.configConfirmationDialogs)
								.toContain(command);
						});
						it("should have a confirm message", function () {
							expect(confirm.message)
								.toEqual(jasmine.any(String));
						});
						if (confirm.detailMessage) {
							it("should return a string detailMessage", function () {
								let detailMessage;
								if (typeof detailMessage === "function") {
									detailMessage = confirm.detailMessage(["test"]);
								} else {
									detailMessage = confirm.detailMessage;
								}
								expect(confirm.detailMessage)
									.toEqual(jasmine.any(String));
							});
						}
						it("should be called if atom.confirm returns true", async function () {
							this.confirmSpy.and.returnValue(true);
							await dispatch({ target: atom.views.getView(atom.workspace) });
							expect(this.confirmSpy)
								.toHaveBeenCalled();
							expect(this.cmdSpy)
								.toHaveBeenCalled();
						});
						it("should not be called if atom.confirm returns false", async function () {
							this.confirmSpy.and.returnValue(false);
							try {
								await dispatch({ target: atom.views.getView(atom.workspace) });
							} catch (ex) {}
							expect(this.confirmSpy)
								.toHaveBeenCalled();
							expect(this.cmdSpy)
								.not.toHaveBeenCalled();
						});
					} else {
						it("should not have a config option to disable the confirm dialog", function () {
							expect(this.configConfirmationDialogs)
								.not.toContain(command);
						});
						it("should not call atom.confirm but should call the command", async function () {
							await dispatch({ target: atom.views.getView(atom.workspace) });
							expect(this.confirmSpy)
								.not.toHaveBeenCalled();
							expect(this.cmdSpy)
								.toHaveBeenCalled();
						});
					}
				});
			});
	});
});
