/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";
import {promisify} from "promisificator";
import fs from "fs";

describe("git.rebase", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.branch = "branch";
		this.gitRoot = "root";
	});

	it("should send ['rebase', branch, '--quiet'] to cmd", async function () {
		await gitCmd.rebase(this.gitRoot, this.branch);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["rebase", this.branch, "--quiet"]);
	});

	it("should send --verbose to cmd", async function () {
		await gitCmd.rebase(this.gitRoot, this.branch, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
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

		it("should rebase a branch", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test");
			await gitCmd.cmd(this.gitRoot, ["add", "."]);
			await gitCmd.cmd(this.gitRoot, ["commit", "--message=new branch commit"]);
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", "master"]);
			await gitCmd.rebase(this.gitRoot, newBranch);
			const lastCommit = await gitCmd.cmd(this.gitRoot, ["log", "--max-count=1", "--format=%B"], "", false);

			expect(lastCommit).toBe("new branch commit");
		});

	});

});
