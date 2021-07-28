/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";
import {promisify} from "promisificator";
import fs from "fs";

describe("git.merge", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.branch = "branch";
		this.gitRoot = "root";
	});

	it("should send ['merge', branch, '--quiet'] to cmd", async function () {
		await gitCmd.merge(this.gitRoot, this.branch);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["merge", this.branch, "--quiet"]);
	});

	it("should send --verbose to cmd", async function () {
		await gitCmd.merge(this.gitRoot, this.branch, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
	});

	(process.env.CI ? describe : xdescribe)("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot(true, true);
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should merge a branch", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=new branch commit"]);
			await gitCmd.cmd(this.gitRoot, ["checkout", "master"]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t2), "test");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=master branch commit"]);

			await gitCmd.merge(this.gitRoot, newBranch, true);

			let lastCommits = await gitCmd.cmd(this.gitRoot, ["log", "--max-count=3", "--format=%B"], "", false);
			lastCommits = lastCommits.split("\n").filter(i => i);

			expect(lastCommits).toEqual([
				jasmine.stringMatching("Merge branch 'new-branch'"),
				"master branch commit",
				"new branch commit",
			]);
		});

	});

});
