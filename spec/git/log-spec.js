/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot} from "../mocks";

describe("git.log", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.gitPath = getFilePath(this.gitRoot, ".git");
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should return error if not git", async function () {
		let error = false;
		try {
			await gitCmd.remove(this.gitRoot);
			await gitCmd.log(this.gitRoot);
		} catch (ex) {
			error = true;
		}
		expect(error).toBe(true);
	});

	it("should return an empty string if no commits", async function () {
		expect(await gitCmd.log(this.gitRoot)).toBe("");
	});

	it("should return the commit", async function () {
		await gitCmd.cmd(this.gitRoot, ["add", "."]);
		await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init commit"]);
		expect(await gitCmd.log(this.gitRoot, 1, 0, "%B")).toBe("init commit");
	});

	it("should use the format", async function () {
		await gitCmd.cmd(this.gitRoot, ["add", "."]);
		await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init commit"]);
		expect(await gitCmd.log(this.gitRoot, 1, 0, "oneline")).not.toBe("init commit");
		expect(await gitCmd.log(this.gitRoot, 1, 0, "oneline")).toContain("init commit");
	});

});
