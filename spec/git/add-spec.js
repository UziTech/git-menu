"use babel";
/* globals atom */

import gitCmd from "../../lib/git-cmd";
import { getFilePath, removeGitRoot, createGitRoot, files } from "../mocks";

describe("git.add", function () {

	describe("unit tests", function () {

		beforeEach(function(){
			spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

			this.files = ["file1", "file2"];
			this.gitRoot = "root";
		});

		it("should send ['add', '--', ...files] to cmd", async function(){
			await gitCmd.add(this.gitRoot, this.files);

			expect(gitCmd.cmd.calls.mostRecent().args[1]).toEqual(["add", "--", ...this.files]);
		});

		it("should send --verbose to cmd", async function(){
			await gitCmd.add(this.gitRoot, this.files, true);

			expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
		});
	});

	describe("integration tests", function () {

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

	});

});
