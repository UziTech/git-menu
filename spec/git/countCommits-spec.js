"use babel";
/* globals atom */

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
import fs from "fs";

fdescribe("git.countCommits", function () {

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

	it("should return 0 if no commits", async function () {
		expect(await gitCmd.countCommits(this.gitRoot)).toBe(0);
	});

	it("should be number of commits", async function () {
		await gitCmd.cmd(this.gitRoot, ["add", "."]);
		await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init"]);
		expect(await gitCmd.countCommits(this.gitRoot)).toBe(1);
	});

});
