"use babel";

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";
import fs from "fs";

describe("git.status", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);
		this.gitPath = getFilePath(".git");
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should return status of t1", async function () {
		await gitCmd.cmd(this.gitRoot, ["init"]);
		const status = await gitCmd.status(this.gitRoot, getFilePath([files.t1]));
		expect(status[0])
			.toEqual(jasmine.objectContaining({ added: false, untracked: true, deleted: false, changed: false, file: files.t1 }));
	});

	it("should return empty array on no status", async function () {
		spyOn(gitCmd, "cmd")
			.and.returnValue(Promise.resolve(""));
		const status = await gitCmd.status(this.gitRoot, getFilePath([files.t1]));
		expect(status)
			.toEqual([]);
	});

	it("should return rejected promise on unknown status code", async function () {
		spyOn(gitCmd, "cmd")
			.and.returnValue(Promise.resolve("ZZ " + files.t1));
		const error = await gitCmd.status(this.gitRoot, getFilePath([files.t1]))
			.then(_ => false, err => err);
		expect(error)
			.toBeTruthy();
	});

});
