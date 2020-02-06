/** @babel */

import path from "path";
import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("git.rootDir", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve("root"));

		this.gitRoot = "root";
	});

	it("should send ['rev-parse', '--show-toplevel'] to cmd", async function () {
		await gitCmd.rootDir(this.gitRoot);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toEqual(["rev-parse", "--show-toplevel"]);
	});

	it("should return path from cmd", async function () {
		const root = await gitCmd.rootDir("test");

		expect(root).toEqual("root");
	});

	it("should return cwd for smb path", async function () {
		gitCmd.cmd.and.returnValue(Promise.resolve("\\\\root"));
		const root = await gitCmd.rootDir("test");

		expect(root).toEqual("test");
	});

	it("should return cwd for smb:// path", async function () {
		gitCmd.cmd.and.returnValue(Promise.resolve("smb://root"));
		const root = await gitCmd.rootDir("test");

		expect(root).toEqual("test");
	});

	describe("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot();

			this.gitPath = getFilePath(this.gitRoot, ".git");
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should get root dir", async function () {
			const root = await gitCmd.rootDir(getFilePath(this.gitRoot, path.dirname(files.tt1)));

			expect(root).toContain(this.gitRoot);
		});

	});

});
