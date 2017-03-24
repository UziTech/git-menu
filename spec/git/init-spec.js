"use babel";
/* globals atom */

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
import fs from "fs";

describe("git.init", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should create a .git folder", async function () {
		let commitCount;
		try {
			await gitCmd.init(this.gitRoot);
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init"]);
			commitCount = await gitCmd.cmd(this.gitRoot, ["rev-list", "--all", "--count"]);
		} catch (ex) {
			throw ex;
		}
		const gitPath = getFilePath(".git");
		expect(fs.existsSync(gitPath)).toBe(true);
		expect(commitCount).toBe("1");
	});

	it("should return nothing on --quiet", async function () {
		let result;
		try {
			result = await gitCmd.init(this.gitRoot);
		} catch (ex) {
			throw ex;
		}
		expect(result).toBe("");
	});

	it("should return something on verbose", async function () {
		let result;
		try {
			result = await gitCmd.init(this.gitRoot, true);
		} catch (ex) {
			throw ex;
		}
		expect(result).not.toBe("");
	});

});
