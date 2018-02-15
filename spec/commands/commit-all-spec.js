/** @babel */

import commitAll from "../../lib/commands/commit-all";
import commit from "../../lib/commands/commit";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("commit-all", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call commit with project folders", async function () {
		spyOn(commit, "command").and.callFake(() => Promise.resolve());
		try {
			await commitAll.command(this.filePaths);
		} catch (ex) {}
		expect(commit.command.calls.mostRecent().args[0]).toEqual(atom.project.getPaths());
	});
});
