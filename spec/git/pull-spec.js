/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";
import {promisify} from "promisificator";
import fs from "fs";

describe("git.pull", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValues(
			Promise.resolve("## master"),
			Promise.resolve(),
		);

		this.gitRoot = "root";
	});

	it("should send ['pull', '--quiet'] to cmd", async function () {
		await gitCmd.pull(this.gitRoot);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["pull", "--quiet"]);
	});

	it("should send --rebase to cmd", async function () {
		await gitCmd.pull(this.gitRoot, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--rebase");
	});

	it("should send --force to cmd", async function () {
		await gitCmd.pull(this.gitRoot, false, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--force");
	});

	it("should send --verbose to cmd", async function () {
		await gitCmd.pull(this.gitRoot, false, false, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
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

		it("should merge", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await gitCmd.cmd(this.gitRoot, ["push", "--set-upstream", "origin", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test1");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=test1"]);

			await gitCmd.cmd(this.originRoot, ["checkout", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.originRoot, files.t2), "test2");
			await gitCmd.cmd(this.originRoot, ["add", "."]);
			await gitCmd.cmd(this.originRoot, ["commit", "--message=test2"]);

			await gitCmd.pull(this.gitRoot);

			const content = await promisify(fs.readFile)(getFilePath(this.gitRoot, files.t2), {encoding: "utf8"});
			expect(content).toBe("test2");

			const log = await gitCmd.cmd(this.gitRoot, ["log", "--format=%s"]);
			expect(log.trim()).toEqual(jasmine.stringMatching(/^Merge branch/));
			expect(log.trim()).toEqual(jasmine.stringMatching("test1\ntest2\ninit commit"));
		});

		it("should rebase", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await gitCmd.cmd(this.gitRoot, ["push", "--set-upstream", "origin", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test1");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=test1"]);

			await gitCmd.cmd(this.originRoot, ["checkout", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.originRoot, files.t2), "test2");
			await gitCmd.cmd(this.originRoot, ["add", "."]);
			await gitCmd.cmd(this.originRoot, ["commit", "--message=test2"]);

			await gitCmd.pull(this.gitRoot, true);

			const content = await promisify(fs.readFile)(getFilePath(this.gitRoot, files.t2), {encoding: "utf8"});
			expect(content).toBe("test2");

			const log = await gitCmd.cmd(this.gitRoot, ["log", "--format=%s"]);
			expect(log.trim()).toBe("test1\ntest2\ninit commit");
		});

	});

});
