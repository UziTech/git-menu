/** @babel */

import gitCmd from "../../lib/git-cmd";

describe("git.diff", function () {

	beforeEach(function () {
		spyOn(gitCmd, "cmd").and.returnValue(Promise.resolve());

		this.files = ["file1", "file2"];
		this.gitRoot = "root";
	});

	it("should send ['diff', '--ignore-all-space', '--', ...files] to cmd", async function () {
		await gitCmd.diff(this.gitRoot, this.files);

		expect(gitCmd.cmd.calls.mostRecent().args[1].filter(i => !!i)).toEqual(["diff", "--ignore-all-space", "--", ...this.files]);
	});

});
