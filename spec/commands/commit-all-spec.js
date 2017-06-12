"use babel";
/* globals atom */

import commitAll from "../../lib/commands/commit-all";
import commit from "../../lib/commands/commit";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";

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
		spyOn(commit, "command")
			.and.callFake(_ => Promise.resolve());
		try {
			await commitAll.command(this.filePaths);
		} catch (ex) {}
		expect(commit.command.calls.mostRecent()
				.args[0])
			.toEqual(atom.project.getPaths());
	});
});
