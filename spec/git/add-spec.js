"use babel";
/* globals atom */

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";

describe("git.add", function () {

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

	it("should add a file", async function () {
		await gitCmd.add(this.gitRoot, getFilePath(files.t1));
		const status = await gitCmd.cmd(this.gitRoot, ["status", "--short"]);

		expect(status).toContain(`A  ${files.t1}`);
	});

	it("should return nothing on --quiet", async function () {
		const result = await gitCmd.add(this.gitRoot, getFilePath(files.t1));

		expect(result).toBe("");
	});

	it("should return something on verbose", async function () {
		const result = await gitCmd.add(this.gitRoot, getFilePath(files.t1), true);

		expect(result).not.toBe("");
	});

});
