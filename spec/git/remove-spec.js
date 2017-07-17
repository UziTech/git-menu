"use babel";

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
import fs from "fs";

describe("git.remove", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);
		await gitCmd.cmd(this.gitRoot, ["init"]);
		this.gitPath = getFilePath(".git");
	});

	afterEach(function () {
		removeGitRoot();
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
