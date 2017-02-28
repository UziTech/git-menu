"use babel";
/* globals describe, beforeEach, atom, it, expect, waitsForPromise, runs, spyOn, jasmine */

import commands from "../lib/commands";
import config from "../lib/config";
import rimraf from "../lib/rimraf";

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("Context Git", function () {
	beforeEach(function () {
		waitsForPromise(async _ => {
			await atom.packages.activatePackage("context-git");
			this.configOptions = atom.config.getAll("context-git")[0].value;
			this.configContextMenuItems = Object.keys(this.configOptions.contextMenuItems);
			this.allConfig = Object.keys(this.configOptions);
			this.allCommands = atom.commands
				.findCommands({ target: atom.views.getView(atom.workspace) })
				.map(cmd => cmd.name)
				.filter(cmd => cmd.startsWith("context-git:"));
			this.contextMenuItems = atom.contextMenu.itemSets
				.filter(itemSet => itemSet.selector === "atom-text-editor, .tree-view, .tab-bar")
				.map(itemSet => itemSet.items[0].submenu[0].command);
		});
	});

	describe("Config", function () {
		Object.keys(config).forEach(configOption => {
			it("has a config option: " + configOption, function () {
				expect(this.allConfig).toContain(configOption);
			});
		});
	});

	describe("Commands", function () {
		Object.keys(commands).forEach(command => {
			const cmd = "context-git:" + command;
			const label = commands[command].label;
			const description = commands[command].description;
			const func = commands[command].command;
			it("should have a command in the command pallete: " + command, function () {
				expect(this.allCommands).toContain(cmd);
			});
			it("should have a command: " + command, function () {
				expect(typeof func).toBe("function");
			});
			if (label) {
				it("should have a config option to disable it in the context menu: " + command, function () {
					expect(this.configContextMenuItems).toContain(command);
				});
				it("should have a description: " + command, function () {
					expect(description).toBeTruthy();
				});
				it("should have a context menu item: " + command, function () {
					expect(this.contextMenuItems).toContain(cmd);
				});
			} else {
				it("should not have a config option to disable it in the context menu: " + command, function () {
					expect(this.configContextMenuItems).not.toContain(command);
				});
				it("should not have a context menu item: " + command, function () {
					expect(this.contextMenuItems).not.toContain(cmd);
				});
			}
		});
	});
});
