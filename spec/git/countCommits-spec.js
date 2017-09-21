"use babel";

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
import fs from "fs";

describe("git.countCommits", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();

		this.gitPath = getFilePath(this.gitRoot, ".git");
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should return error if not git", async function () {
		let error = false;
		try {
			await gitCmd.remove(this.gitRoot);
			await gitCmd.countCommits(this.gitRoot);
		} catch (ex) {
			error = true;
		}
		expect(error).toBe(true);
	});

	it("should return 0 if no commits", async function () {
		expect(await gitCmd.countCommits(this.gitRoot)).toBe(0);
	});

	it("should be number of commits", async function () {
		await gitCmd.cmd(this.gitRoot, ["add", "."]);
		await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init"]);
		expect(await gitCmd.countCommits(this.gitRoot)).toBe(1);
	});

});
