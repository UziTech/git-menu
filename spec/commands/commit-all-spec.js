/** @babel */

import commitAll from "../../lib/commands/commit-all";
import commit from "../../lib/commands/commit";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("commit-all", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call commit with project folders", async function () {
		spyOn(commit, "command").and.callFake(() => Promise.resolve());
		await commitAll.command(this.filePaths);
		expect(commit.command.calls.mostRecent().args[0]).toEqual(atom.project.getPaths());
	});

	it("should only send project folders that contain filePaths", async function () {
		spyOn(commit, "command").and.callFake(() => Promise.resolve());
		const [projectFolder] = atom.project.getPaths();
		spyOn(atom.project, "getPaths").and.callFake(() => [projectFolder, "test"]);
		await commitAll.command(this.filePaths);
		expect(commit.command.calls.mostRecent().args[0]).toEqual([projectFolder]);
	});
});
