"use babel";
/* globals atom */

import { Directory } from "atom";
import commands from "../../lib/commands";
import Notifications from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files } from "../mocks";

describe("run-command", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);
		this.repo = await atom.project.repositoryForDirectory(new Directory(this.gitRoot));

		this.statuses = [fileStatus("M ", files.t1)];
		this.filePaths = getFilePath([files.t1]);
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

	afterEach(function () {
		removeGitRoot();
	});

	describe("dialog", function () {

		it("should call dialog with correct props", async function () {
			spyOn(this, "dialog").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.dialog).toHaveBeenCalledWith({
				files: this.statuses
			});
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.dialog.prototype.activate).toHaveBeenCalled();
		});
	});

	describe("cancel", function () {

		it("should reject without an error", async function () {
			this.dialog = mockDialog({
				activate: _ => Promise.reject()
			});
			let error;
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
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
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = ex;
			}
			expect(error).toBe("Command cannot be blank.");
		});

		it("should show running... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(statusBar.show).toHaveBeenCalledWith("Running...", null);
		});

		it("should call git.cmd", async function () {
			this.dialogReturn[0] = " git command arg1 --arg2=\"test string\" ";
			spyOn(this.git, "cmd").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, ["command", "arg1", "--arg2=\"test string\""]);
		});

		it("should call git.cmd", async function () {
			spyOn(this.git, "cmd").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, [this.dialogReturn[0]]);
		});

		it("should call git.cmd with files", async function () {
			this.dialogReturn[0] = "command arg1 %files%";
			spyOn(this.git, "cmd").and.callThrough();
			try {
				await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.cmd).toHaveBeenCalledWith(this.gitRoot, ["command", "arg1", getFilePath(this.dialogReturn[1][0])]);
		});

		it("should return '1 File committed.'", async function () {
			const ret = await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("'git command' ran with 1 file.");
		});

		it("should return '2 Files committed.'", async function () {
			this.dialogReturn[1] = [files.t1, files.t2];
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			const ret = await commands["run-command"].command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("'git command' ran with 2 files.");
		});
	});

});
