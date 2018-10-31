/** @babel */

import gitCmd from "../../lib/git-cmd";
import {removeGitRoot, createGitRoot} from "../mocks";

describe("git.cmd", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call git", async function () {
		let error;
		try {
			await gitCmd.cmd(this.gitRoot);
		} catch (ex) {
			error = ex;
		}
		expect(error).toContain("usage: git [--version]");
	});

	it("should call git with the args", async function () {
		let error;
		try {
			await gitCmd.cmd(this.gitRoot, ["test"]);
		} catch (ex) {
			error = ex;
		}
		expect(error).toContain("git: 'test' is not a git command.");
	});

	it("should reject on error", async function () {
		let rejected;
		try {
			await gitCmd.cmd(this.gitRoot, ["test"]);
		} catch (ex) {
			rejected = true;
		}
		expect(rejected).toBeTruthy();
	});

	it("should resolve on non-error", async function () {
		await gitCmd.cmd(this.gitRoot, ["init"]);
		pass();
	});

});
