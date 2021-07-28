/** @babel */

import gitCmd from "../../lib/git-cmd";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("git.add", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.files = ["file1", "file2"];
		this.gitRoot = "root";
	});

	it("should send ['add', '--', ...files] to cmd", async function () {
		await gitCmd.add(this.gitRoot, this.files);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["add", "--", ...this.files]);
	});

	it("should send --verbose to cmd", async function () {
		await gitCmd.add(this.gitRoot, this.files, true);

		expect(gitCmd.cmd.calls.mostRecent().args[1]).toContain("--verbose");
	});

	(process.env.CI ? describe : xdescribe)("integration tests", function () {

		beforeEach(async function () {
			gitCmd.cmd.and.callThrough();
			await atom.packages.activatePackage("git-menu");
			this.gitRoot = await createGitRoot();

			this.gitPath = getFilePath(this.gitRoot, ".git");
		});

		afterEach(async function () {
			await removeGitRoot(this.gitRoot);
		});

		it("should add a file", async function () {
			await gitCmd.add(this.gitRoot, getFilePath(this.gitRoot, [files.t1]));
			const status = await gitCmd.cmd(this.gitRoot, ["status", "--short"]);

			expect(status).toContain(`A  ${files.t1}`);
		});

	});

});
