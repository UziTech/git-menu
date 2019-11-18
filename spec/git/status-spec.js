/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("git.status", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.gitPath = getFilePath(this.gitRoot, ".git");
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	xit("should return status of t1", async function () {
		await gitCmd.cmd(this.gitRoot, ["init"]);
		const status = await gitCmd.status(this.gitRoot, getFilePath(this.gitRoot, [files.t1]));
		expect(status[0]).toEqual(jasmine.objectContaining({added: false, untracked: true, deleted: false, changed: false, file: files.t1}));
	});

	it("should return empty array on no status", async function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve(""));
		const status = await gitCmd.status(this.gitRoot, getFilePath(this.gitRoot, [files.t1]));
		expect(status).toEqual([]);
	});

	it("should return rejected promise on unknown status code", async function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve(`ZZ ${files.t1}`));
		const error = await gitCmd.status(this.gitRoot, getFilePath(this.gitRoot, [files.t1])).then(() => false, err => err);
		expect(error).toBeTruthy();
	});

});
