"use babel";
/* globals describe, beforeEach, atom, it, expect, waitsForPromise, runs, spyOn, jasmine */

import commands from "../lib/commands";
import config from "../lib/config";
import rimraf from "../lib/rimraf";

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("Context Git", _ => {
	let configOptions;
	let configContextMenuItems;
	let allConfig;
	let allCommands;
	let contextMenuItems;
	beforeEach(_ => {
		waitsForPromise(_ => atom.packages.activatePackage("context-git").then(_ => {
			configOptions = configOptions || atom.config.getAll("context-git")[0].value;
			configContextMenuItems = configContextMenuItems || Object.keys(configOptions.contextMenuItems);
			allConfig = allConfig || Object.keys(configOptions);
			allCommands = allCommands || atom.commands
				.findCommands({ target: atom.views.getView(atom.workspace) })
				.map(cmd => cmd.name)
				.filter(cmd => cmd.startsWith("context-git:"));
			contextMenuItems = contextMenuItems || atom.contextMenu.itemSets
				.filter(itemSet => itemSet.selector === "atom-text-editor, .tree-view, .tab-bar")
				.map(itemSet => itemSet.items[0].submenu[0].command);
		}));
	});

	describe("Config", _ => {
		Object.keys(config).forEach(configOption => {
			it("has a config option: " + configOption, _ => {
				expect(allConfig).toContain(configOption);
			});
		});
	});

	describe("Commands", _ => {
		Object.keys(commands).forEach(command => {
			const cmd = "context-git:" + command;
			const label = commands[command].label;
			const description = commands[command].description;
			const func = commands[command].command;
			it("has a command in the command pallete: " + command, _ => {
				expect(allCommands).toContain(cmd);
			});
			it("has a command: " + command, _ => {
				expect(typeof func).toBe("function");
			});
			if (label) {
				it("has a config option to disable it in the context menu: " + command, _ => {
					expect(configContextMenuItems).toContain(command);
				});
				it("has a description: " + command, _ => {
					expect(description).toBeTruthy();
				});
				it("has a context menu item: " + command, _ => {
					expect(contextMenuItems).toContain(cmd);
				});
			} else {
				it("does not have a config option to disable it in the context menu: " + command, _ => {
					expect(configContextMenuItems).not.toContain(command);
				});
				it("does not have a context menu item: " + command, _ => {
					expect(contextMenuItems).not.toContain(cmd);
				});
			}
		});
	});
});
