/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";
import {promisify} from "promisificator";
import fs from "fs";

describe("git.push", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValues(
			Promise.resolve("## master"),
			Promise.resolve(),
		);

		this.gitRoot = "root";
	});

	it("should send ['push', '--quiet', '--set-upstream', 'origin', 'master'] to cmd", async function () {
		await gitCmd.push(this.gitRoot);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["push", "--quiet", "--set-upstream", "origin", "master"]);
	});

	it("should send --force to cmd", async function () {
		await gitCmd.push(this.gitRoot, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--force");
	});

	it("should send --verbose to cmd", async function () {
		await gitCmd.push(this.gitRoot, false, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
	});

	it("should track branch", async function () {
		await gitCmd.push(this.gitRoot);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--set-upstream");
	});

	it("should not track already tracked branch", async function () {
		gitCmd.cmd.and.returnValues(
			Promise.resolve("## master...origin/master"),
			Promise.resolve(),
		);
		await gitCmd.push(this.gitRoot);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).not.toContain("--set-upstream");
	});

	describe("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot(true, true);
			this.originRoot = await createGitRoot(true, true);
			await gitCmd.cmd(this.gitRoot, ["remote", "add", "origin", this.originRoot]);
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should push and track a branch", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=commit"]);

			await gitCmd.push(this.gitRoot);

			await gitCmd.cmd(this.originRoot, ["checkout", newBranch]);

			const content = await promisify(fs.readFile)(getFilePath(this.gitRoot, files.t1), {encoding: "utf8"});
			expect(content).toBe("test");

			const result = await gitCmd.cmd(this.gitRoot, ["status", "-b", "--porcelain"]);
			expect(result).toBe("## new-branch...origin/new-branch");
		});

	});

});
