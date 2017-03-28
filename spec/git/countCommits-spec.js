// "use babel";
// /* globals atom */
//
// import gitCmd from "../../lib/git-cmd";
// import { getFilePath, removeGitRoot, createGitRoot } from "../mocks";
// import fs from "fs";
//
// describe("git.countCommits", function () {
//
// 	beforeEach(async function () {
// 		await atom.packages.activatePackage("context-git");
// 		createGitRoot();
// 		this.gitRoot = getFilePath();
// 		atom.project.setPaths([this.gitRoot]);
// 		this.gitPath = getFilePath(".git");
// 	});
//
// 	afterEach(function () {
// 		removeGitRoot();
// 	});
//
// 	// TODO: right now it gets the number of commits of context-git since it is a git folder.
// 	// TODO: maybe we need to move the gitRoot outside of the context-git folder?
// 	//
// 	// it("should return error if not git", async function () {
// 	// 	let error = false;
// 	// 	try {
// 	// 		await gitCmd.countCommits(this.gitRoot);
// 	// 	} catch (ex) {
// 	// 		error = true;
// 	// 	}
// 	// 	expect(error).toBe(true);
// 	// });
//
// 	it("should return 0 if no commits", async function () {
// 		await gitCmd.cmd(this.gitRoot, ["init"]);
// 		expect(await gitCmd.countCommits(this.gitRoot)).toBe(0);
// 	});
//
// 	it("should be number of commits", async function () {
// 		await gitCmd.cmd(this.gitRoot, ["init"]);
// 		await gitCmd.cmd(this.gitRoot, ["add", "."]);
// 		await gitCmd.cmd(this.gitRoot, ["commit", "-m", "init"]);
// 		expect(await gitCmd.countCommits(this.gitRoot)).toBe(1);
// 	});
//
// });
