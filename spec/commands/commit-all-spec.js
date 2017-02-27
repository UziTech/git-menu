"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import commands, { commit } from "../../lib/commands";
const commitAll = commands["commit-all"];
import { getFilePath, removeGitRoot, createGitRoot, files } from "../fixtures";

describe("commit-all", function () {

	beforeEach(function () {
		waitsForPromise(async _ => {
			await atom.packages.activatePackage("context-git");
			createGitRoot();
			this.filePaths = getFilePath([files.t1]);
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should call commit with project folders", function () {
		waitsForPromise(async _ => {
			spyOn(commit, "command").andCallFake(_ => Promise.reject());
			try {
				await commitAll.command(this.filePaths);
			} catch (e) {}
			expect(commit.command.mostRecentCall.args[0]).toEqual(atom.project.getPaths());
		});
	});
});
