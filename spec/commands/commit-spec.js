"use babel";
/* globals atom */

import { Directory } from "atom";
import { commit } from "../../lib/commands";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files } from "../mocks";

describe("commit", function () {

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
			lastCommit: Promise.resolve("last commit"),
			status: Promise.resolve(this.statuses),
			add: Promise.resolve("add result"),
			commit: Promise.resolve("commit result"),
			pull: Promise.resolve("pull result"),
			push: Promise.resolve("push result"),
		});
		this.dialogReturn = [
					"message",
					false,
					false,
					false,
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
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.dialog).toHaveBeenCalledWith({
				files: this.statuses,
				lastCommit: "last commit"
			});
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
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
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

	describe("commit", function () {

		it("should reject on empty message", async function () {
			this.dialogReturn[0] = "";
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			let error;
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = ex;
			}
			expect(error).toBe("Message cannot be blank.");
		});

		it("should show committing... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(statusBar.show).toHaveBeenCalledWith("Committing...", null);
		});

		it("should call git.add", async function () {
			spyOn(this.git, "add").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.add).toHaveBeenCalledWith(this.gitRoot, getFilePath(this.dialogReturn[4]));
		});

		it("should call git.commit", async function () {
			spyOn(this.git, "commit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.commit).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0], this.dialogReturn[1], getFilePath(this.dialogReturn[4]), isVerbose());
		});

		it("should call git.commit with amend", async function () {
			this.dialogReturn[1] = true;
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			spyOn(this.git, "commit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.commit).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0], this.dialogReturn[1], getFilePath(this.dialogReturn[4]), isVerbose());
		});

		it("should show a git.commit result notification", async function () {
			spyOn(Notifications, "addGit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(Notifications.addGit).toHaveBeenCalledWith("commit result");
		});

		it("should call refresh after commit", async function () {
			spyOn(this.repo, "refreshStatus").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.repo.refreshStatus).toHaveBeenCalled();
		});

		it("should return '1 File committed.'", async function () {
			const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("1 File committed.");
		});

		it("should return '2 Files committed.'", async function () {
			this.dialogReturn[4] = [files.t1, files.t2];
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
			const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("2 Files committed.");
		});
	});

	describe("commit & push", function () {

		beforeEach(function () {
			this.dialogReturn[2] = true;
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
		});

		it("should show pushing... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(statusBar.show).toHaveBeenCalledTimes(2);
			expect(statusBar.show).toHaveBeenCalledWith("Pushing...", null);
		});

		it("should call git.push", async function () {
			spyOn(this.git, "push").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.push).toHaveBeenCalledWith(this.gitRoot, false, isVerbose());
		});

		it("should show a git.push result notification", async function () {
			spyOn(Notifications, "addGit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(Notifications.addGit).toHaveBeenCalledWith("push result");
		});

		it("should refresh after push", async function () {
			spyOn(this.repo, "refreshStatus").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.repo.refreshStatus).toHaveBeenCalledTimes(2);
		});

		it("should return numFiles + ' committed & pushed.'", async function () {
			const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("1 File committed & pushed.");
		});
	});

	describe("commit & pull & push", function () {

		beforeEach(function () {
			this.dialogReturn[2] = true;
			this.dialogReturn[3] = true;
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
		});

		it("should show pulling... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(statusBar.show).toHaveBeenCalledTimes(3);
			expect(statusBar.show).toHaveBeenCalledWith("Pulling...", null);
		});

		it("should call git.pull", async function () {
			spyOn(this.git, "pull").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, false, isVerbose());
		});

		it("should show git notification for pull results", async function () {
			spyOn(Notifications, "addGit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(Notifications.addGit).toHaveBeenCalledWith("pull result");
		});

		it("should show pushing... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(statusBar.show).toHaveBeenCalledTimes(3);
			expect(statusBar.show).toHaveBeenCalledWith("Pushing...", null);
		});

		it("should call git.push", async function () {
			spyOn(this.git, "push").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.git.push).toHaveBeenCalledWith(this.gitRoot, false, isVerbose());
		});

		it("should show git notification for push result", async function () {
			spyOn(Notifications, "addGit").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(Notifications.addGit).toHaveBeenCalledWith("push result");
		});

		it("should refresh after pulling and pushing", async function () {
			spyOn(this.repo, "refreshStatus").and.callThrough();
			try {
				await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {}
			expect(this.repo.refreshStatus).toHaveBeenCalledTimes(3);
		});

		it("should return numfiles + ' committed & pulled & pushed.'", async function () {
			const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(ret).toBe("1 File committed & pulled & pushed.");
		});

	});

});
