/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot} from "../mocks";
import fs from "fs";

describe("git.init", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.gitRoot = "root";
	});

	it("should send init commad", async function () {
		await gitCmd.init(this.gitRoot, false);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toEqual(["init", "--quiet"]);
	});

	it("should remove --quiet parameter", async function () {
		await gitCmd.init(this.gitRoot, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).not.toContain("--quiet");
	});

	describe("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot(false);


			this.gitPath = getFilePath(this.gitRoot, ".git");
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should create a .git folder", async function () {
			await gitCmd.init(this.gitRoot);
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init"]);
			const commitCount = await gitCmd.cmd(this.gitRoot, ["rev-list", "--all", "--count"]);

			// eslint-disable-next-line no-sync
			expect(fs.existsSync(this.gitPath)).toBe(true);
			expect(commitCount.replace(/^[^\n]*\n\n/, "")).toBe("1");
		});

		it("should return nothing on --quiet", async function () {
			const result = await gitCmd.init(this.gitRoot);

			expect(result).toBe("");
		});

		it("should return something on verbose", async function () {
			const result = await gitCmd.init(this.gitRoot, true);

			expect(result).not.toBe("");
		});

	});

});
