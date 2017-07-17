"use babel";
/* globals atom */

import discardAllChanges from "../../lib/commands/discard-all-changes";
import discardChanges from "../../lib/commands/discard-changes";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";

describe("discard-all-changes", function () {

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

	it("should call discard changes with project folders", async function () {
		spyOn(discardChanges, "command")
			.and.callFake(_ => Promise.resolve());
		try {
			await discardAllChanges.command(this.filePaths);
		} catch (ex) {}
		expect(discardChanges.command.calls.mostRecent()
				.args[0])
			.toEqual(atom.project.getPaths());
	});
});
