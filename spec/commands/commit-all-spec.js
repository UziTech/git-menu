"use babel";
/* globals atom */

import commands from "../../lib/commands";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../fixtures";

// this is needed for jasmine-promises https://github.com/matthewjh/jasmine-promises/issues/8
global.jasmineRequire = {};
require("jasmine-promises");

describe("commit-all", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);

		this.filePaths = getFilePath([files.t1]);
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should call commit with project folders", async function () {
		spyOn(commands.commit, "command").and.callFake(_ => Promise.resolve());
		try {
			await commands["commit-all"].command(this.filePaths);
		} catch (ex) {}
		expect(commands.commit.command.calls.mostRecent().args[0]).toEqual(atom.project.getPaths());
	});
});
