"use babel";

import discardAllChanges from "../../lib/commands/discard-all-changes";
import discardChanges from "../../lib/commands/discard-changes";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";

describe("discard-all-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
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
