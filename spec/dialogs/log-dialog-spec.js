/** @babel */

import LogDialog from "../../lib/dialogs/LogDialog";
import {mockGit, createGitRoot} from "../mocks";

describe("LogDialog", function () {
	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();
		this.git = mockGit({
			log: Promise.resolve(""),
		});
	});

	describe("unescaping format", function () {
		beforeEach(function () {
			spyOn(this.git, "log").and.callThrough();
		});

		it("should change \\\\ to \\", function () {
			const dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\\\"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "\\");
		});

		it("should change \\\\n to %n", function () {
			const dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\n"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "%n");
		});

		it("should change \\\\t to \\t", function () {
			const dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\t"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "\t");
		});

		it("should not unescape a slash at the end", function () {
			let dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\n\\t\\"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "%n\t\\");

			this.git.log.calls.reset();

			dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\n\\t\\\\"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "%n\t\\");
		});

		it("should not unescape an odd number of slashes at the end", function () {
			let dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\n\\t\\\\\\"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "%n\t\\\\");

			this.git.log.calls.reset();

			dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: "\\n\\t\\\\\\\\"});
			dialog.getLogs();

			expect(this.git.log).toHaveBeenCalledWith(this.gitRoot, 10, 0, "%n\t\\\\");
		});

	});

	it("should call getLogs when scrolled to the bottom", async function () {
		const dialog = new LogDialog({root: this.gitRoot, gitCmd: this.git, format: ""});
		spyOn(dialog, "getLogs");

		expect(dialog.getLogs).not.toHaveBeenCalled();

		dialog.scroll({
			target: {
				scrollHeight: 1000,
				scrollTop: 0,
				clientHeight: 100,
			}
		});

		expect(dialog.getLogs).not.toHaveBeenCalled();

		dialog.scroll({
			target: {
				scrollHeight: 1000,
				scrollTop: 900,
				clientHeight: 100,
			}
		});

		expect(dialog.getLogs).toHaveBeenCalled();
	});
});
