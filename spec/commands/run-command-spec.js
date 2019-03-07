/** @babel */

import runCommand from "../../lib/commands/run-command";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("run-command", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.statuses = [fileStatus("M ", files.t1)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: Promise.resolve(this.statuses),
			cmd: Promise.resolve("cmd result"),
		});
		this.dialogReturn = [
			"command",
			[files.t1]
		];
		this.dialog = mockDialog({
			activate: Promise.resolve(this.dialogReturn)
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	describe("dialog", function () {

		it("should call dialog with correct props", async function () {
			spyOn(this, "dialog").and.callThrough();
			try {
				await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				// do nothing
			}
			expect(this.dialog).toHaveBeenCalledWith({
				files: this.statuses
			});
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.dialog.prototype.activate).toHaveBeenCalled();
		});
	});

	describe("cancel", function () {

		it("should reject without an error", async function () {
			this.dialog = mockDialog({
				activate: () => Promise.reject()
			});
			let error;
			try {
				await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

	describe("run", function () {

		it("should reject on empty message", async function () {
			this.dialogReturn[0] = "";
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			let error;
			try {
				await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = ex;
			}
			expect(error).toBe("Command cannot be blank.");
		});

		it("should show running... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(statusBar.show).toHaveBeenCalledWith("Running...");
		});

		it("should call git.cmd", async function () {
			this.dialogReturn[0] = " git command arg1 --arg2=\"test string\" ";
			spyOn(this.git, "cmd").and.callThrough();
			await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, ["command", "arg1", "--arg2=\"test string\""]);
		});

		it("should call git.cmd", async function () {
			spyOn(this.git, "cmd").and.callThrough();
			await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, [this.dialogReturn[0]]);
		});

		it("should call git.cmd with files", async function () {
			this.dialogReturn[0] = "command arg1 %files%";
			spyOn(this.git, "cmd").and.callThrough();
			await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, ["command", "arg1", getFilePath(this.gitRoot, this.dialogReturn[1][0])]);
		});

		it("should return 'Ran {command}'", async function () {
			const ret = await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret.message).toBe("Ran 'git command'");
		});

		it("should return 'with 1 file.'", async function () {
			this.dialogReturn[0] = "command %files%";
			const ret = await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret.message).toBe("Ran 'git command %files%' with 1 file.");
		});

		it("should return 'with 2 files.'", async function () {
			this.dialogReturn = [
				"command %files%",
				[files.t1, files.t2]
			];
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			const ret = await runCommand.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret.message).toBe("Ran 'git command %files%' with 2 files.");
		});
	});

});
