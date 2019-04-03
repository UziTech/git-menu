/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";
import {promisify} from "promisificator";
import fs from "fs";

describe("git.abort", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.branch = "branch";
		this.gitRoot = "root";
	});

	it("should send ['merge', '--abort'] to cmd", async function () {
		await gitCmd.abort(this.gitRoot, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => i)).toEqual(["merge", "--abort"]);
	});

	it("should send ['rebase', '--abort'] to cmd", async function () {
		await gitCmd.abort(this.gitRoot, false);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => i)).toEqual(["rebase", "--abort"]);
	});

	describe("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot(true, true);

			this.gitPath = getFilePath(this.gitRoot, ".git");
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should abort a merge", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test");
			await gitCmd.cmd(this.gitRoot, ["commit", "--all", "--message=new branch commit"]);
			await gitCmd.cmd(this.gitRoot, ["checkout", "master"]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test1");
			await gitCmd.cmd(this.gitRoot, ["commit", "--all", "--message=master branch commit"]);
			try {
				await gitCmd.cmd(this.gitRoot, ["merge", newBranch]);
			} catch (ex) {} // eslint-disable-line no-empty

			const beforeStatus = await gitCmd.cmd(this.gitRoot, ["status"]);
			expect(beforeStatus).toContain("You have unmerged paths.");

			await gitCmd.abort(this.gitRoot, true);

			const afterStatus = await gitCmd.cmd(this.gitRoot, ["status"]);
			expect(afterStatus).not.toContain("You have unmerged paths.");
		});

		it("should abort a rebase", async function () {
			const newBranch = "new-branch";
			await gitCmd.cmd(this.gitRoot, ["checkout", "-b", newBranch]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test");
			await gitCmd.cmd(this.gitRoot, ["commit", "--all", "--message=new branch commit"]);
			await gitCmd.cmd(this.gitRoot, ["checkout", "master"]);
			await promisify(fs.writeFile)(getFilePath(this.gitRoot, files.t1), "test1");
			await gitCmd.cmd(this.gitRoot, ["commit", "--all", "--message=master branch commit"]);
			try {
				await gitCmd.cmd(this.gitRoot, ["rebase", newBranch]);
			} catch (ex) {} // eslint-disable-line no-empty

			const beforeStatus = await gitCmd.cmd(this.gitRoot, ["status"]);
			expect(beforeStatus).toContain("rebase in progress");

			await gitCmd.abort(this.gitRoot, false);

			const afterStatus = await gitCmd.cmd(this.gitRoot, ["status"]);
			expect(afterStatus).not.toContain("rebase in progress");
		});

	});

});
