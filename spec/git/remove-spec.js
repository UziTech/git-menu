"use babel";

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
import fs from "fs";

describe("git.remove", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();

		await gitCmd.cmd(this.gitRoot, ["init"]);
		this.gitPath = getFilePath(this.gitRoot, ".git");
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should remove the .git folder", async function () {
		await gitCmd.remove(this.gitRoot);

		expect(fs.existsSync(this.gitPath))
			.toBe(false);
	});

	it("should be idempotent", async function () {
		await gitCmd.remove(this.gitRoot);
		await gitCmd.remove(this.gitRoot);

		expect(fs.existsSync(this.gitPath))
			.toBe(false);
	});

});
