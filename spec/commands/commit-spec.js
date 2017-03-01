"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import { Directory } from "atom";
import { commit } from "../../lib/commands";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files } from "../fixtures";

describe("commit", function () {

	beforeEach(function () {
		waitsForPromise(async _ => {
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
	});

	afterEach(function () {
		removeGitRoot();
	});

	describe("dialog", function () {

		it("should call dialog with correct props", function () {
			waitsForPromise(async _ => {
				spyOn(this, "dialog").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.dialog).toHaveBeenCalledWith({
					files: this.statuses,
					lastCommit: "last commit"
				});
			});
		});

		it("should call dialog.activate()", function () {
			waitsForPromise(async _ => {
				spyOn(this.dialog.prototype, "activate").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.dialog.prototype.activate).toHaveBeenCalled();
			});
		});
	});

	describe("cancel", function () {

		it("should reject without an error", function () {
			waitsForPromise(async _ => {
				this.dialog = mockDialog({
					activate: Promise.reject()
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
	});

	describe("commit", function () {

		it("should reject on empty message", function () {
			waitsForPromise(async _ => {
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
		});

		it("should show committing... in status bar", function () {
			waitsForPromise(async _ => {
				spyOn(statusBar, "show").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(statusBar.show).toHaveBeenCalledWith("Committing...", null);
			});
		});

		it("should call git.add", function () {
			waitsForPromise(async _ => {
				spyOn(this.git, "add").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.add).toHaveBeenCalledWith(this.gitRoot, getFilePath(this.dialogReturn[4]));
			});
		});

		it("should call git.commit", function () {
			waitsForPromise(async _ => {
				spyOn(this.git, "commit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.commit).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0], this.dialogReturn[1], getFilePath(this.dialogReturn[4]), isVerbose());
			});
		});

		it("should call git.commit with amend", function () {
			waitsForPromise(async _ => {
				this.dialogReturn[1] = true;
				this.dialog = mockDialog({
					activate: Promise.resolve(this.dialogReturn)
				});
				spyOn(this.git, "commit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.commit).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0], this.dialogReturn[1], getFilePath(this.dialogReturn[4]), isVerbose());
			});
		});

		it("should show a git.commit result notification", function () {
			waitsForPromise(async _ => {
				spyOn(Notifications, "addGit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(Notifications.addGit).toHaveBeenCalledWith("commit result");
			});
		});

		it("should call refresh after commit", function () {
			waitsForPromise(async _ => {
				spyOn(this.repo, "refreshStatus").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.repo.refreshStatus).toHaveBeenCalled();
			});
		});

		it("should return '1 File committed.'", function () {
			waitsForPromise(async _ => {
				const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				expect(ret).toBe("1 File committed.");
			});
		});

		it("should return '2 Files committed.'", function () {
			waitsForPromise(async _ => {
				this.dialogReturn[4] = [files.t1, files.t2];
				this.dialog = mockDialog({
					activate: Promise.resolve(this.dialogReturn)
				});
				const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				expect(ret).toBe("2 Files committed.");
			});
		});
	});

	describe("commit & push", function () {

		beforeEach(function () {
			this.dialogReturn[2] = true;
			this.dialog = mockDialog({
				activate: Promise.resolve(this.dialogReturn)
			});
		});

		it("should show pushing... in status bar", function () {
			waitsForPromise(async _ => {
				spyOn(statusBar, "show").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(statusBar.show.calls.length).toBe(2);
				expect(statusBar.show).toHaveBeenCalledWith("Pushing...", null);
			});
		});

		it("should call git.push", function () {
			waitsForPromise(async _ => {
				spyOn(this.git, "push").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.push).toHaveBeenCalledWith(this.gitRoot, isVerbose());
			});
		});

		it("should show a git.push result notification", function () {
			waitsForPromise(async _ => {
				spyOn(Notifications, "addGit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(Notifications.addGit).toHaveBeenCalledWith("push result");
			});
		});

		it("should refresh after push", function () {
			waitsForPromise(async _ => {
				spyOn(this.repo, "refreshStatus").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.repo.refreshStatus.calls.length).toBe(2);
			});
		});

		it("should return numFiles + ' committed & pushed.'", function () {
			waitsForPromise(async _ => {
				const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				expect(ret).toBe("1 File committed & pushed.");
			});
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

		it("should show pulling... in status bar", function () {
			waitsForPromise(async _ => {
				spyOn(statusBar, "show").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(statusBar.show.calls.length).toBe(3);
				expect(statusBar.show).toHaveBeenCalledWith("Pulling...", null);
			});
		});

		it("should call git.pull", function () {
			waitsForPromise(async _ => {
				spyOn(this.git, "pull").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, isVerbose());
			});
		});

		it("should show git notification for pull results", function () {
			waitsForPromise(async _ => {
				spyOn(Notifications, "addGit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(Notifications.addGit).toHaveBeenCalledWith("pull result");
			});
		});

		it("should show pushing... in status bar", function () {
			waitsForPromise(async _ => {
				spyOn(statusBar, "show").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(statusBar.show.calls.length).toBe(3);
				expect(statusBar.show).toHaveBeenCalledWith("Pushing...", null);
			});
		});

		it("should call git.push", function () {
			waitsForPromise(async _ => {
				spyOn(this.git, "push").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.git.push).toHaveBeenCalledWith(this.gitRoot, isVerbose());
			});
		});

		it("should show git notification for push result", function () {
			waitsForPromise(async _ => {
				spyOn(Notifications, "addGit").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(Notifications.addGit).toHaveBeenCalledWith("push result");
			});
		});

		it("should refresh after pulling and pushing", function () {
			waitsForPromise(async _ => {
				spyOn(this.repo, "refreshStatus").andCallThrough();
				try {
					await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				} catch (ex) {}
				expect(this.repo.refreshStatus.calls.length).toBe(3);
			});
		});

		it("should return numfiles + ' committed & pulled & pushed.'", function () {
			waitsForPromise(async _ => {
				const ret = await commit.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
				expect(ret).toBe("1 File committed & pulled & pushed.");
			});
		});

	});

});
