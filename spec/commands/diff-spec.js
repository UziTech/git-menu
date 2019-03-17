/** @babel */

import diff from "../../lib/commands/diff";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, files} from "../mocks";

describe("diff", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			diff: Promise.resolve("diff result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should show diffing... in status bar", async function () {
		spyOn(statusBar, "show").and.callThrough();
		await diff.command(this.filePaths, statusBar, this.git, Notifications);
		expect(statusBar.show).toHaveBeenCalledWith("Diffing...");
	});

	it("should call git.diff", async function () {
		spyOn(this.git, "diff").and.callThrough();
		await diff.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.diff).toHaveBeenCalledWith(this.gitRoot, this.filePaths);
	});

	it("should open textEditor with diff results", async function () {
		spyOn(atom.workspace, "open").and.callThrough();
		await diff.command(this.filePaths, statusBar, this.git, Notifications);
		expect(atom.workspace.open).toHaveBeenCalled();
		const text = atom.workspace.getActiveTextEditor().getText();
		expect(text).toBe("diff result");
	});

	it("should return 'Diffed.'", async function () {
		const ret = await diff.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret.message).toBe("Diff opened.");
	});

});
