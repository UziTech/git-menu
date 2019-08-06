/** @babel */

import unignoreChanges from "../../lib/commands/unignore-changes";
import ignoreChanges from "../../lib/commands/ignore-changes";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("unignore-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call ignore changes with ignore = false", async function () {
		spyOn(ignoreChanges, "command").and.callFake(() => Promise.resolve());
		await unignoreChanges.command(this.filePaths);
		expect(ignoreChanges.command.calls.mostRecent().args[4]).toBe(false);
	});
});
