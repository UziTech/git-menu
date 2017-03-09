"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import commands from "../../lib/commands";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../fixtures";

describe("commit-all", function () {

	beforeEach(function (done) {
		atom.packages.activatePackage("context-git").then(_ => {
			createGitRoot();
			this.gitRoot = getFilePath();
			atom.project.setPaths([this.gitRoot]);

			this.filePaths = getFilePath([files.t1]);
			done();
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should call commit with project folders", function (done) {
		spyOn(commands.commit, "command").and.callFake(_ => Promise.reject());
		commands["commit-all"].command(this.filePaths).then(_ => { throw "Not supposed to be here"; }, _ => {
			expect(commands.commit.command.calls.mostRecent().args[0]).toEqual(atom.project.getPaths());
			done();
		});
	});
});
