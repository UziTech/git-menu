"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import { commit } from "../../lib/commands";
import { getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files } from "../fixtures";

spyOn.andThrow = function (error) {
	this.andCallFake(_ => { throw error; });
};

describe("commit", function () {

	beforeEach(function () {
		waitsForPromise(_ => {
			return atom.packages.activatePackage("context-git").then(_ => {
				createGitRoot();
			});
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	describe("dialog", function () {
		beforeEach(function () {
			this.filePaths = getFilePath([files.t1]);
			this.statuses = [fileStatus("M ", files.t1)];
			this.git = mockGit({
				rootDir: Promise.resolve(getFilePath()),
				lastCommit: Promise.resolve("last commit"),
				status: Promise.resolve(this.statuses),
			});
			this.dialog = mockDialog();
		});
		it("should call dialog with correct props", function () {
			spyOn(this, "dialog").andCallThrough();
			waitsForPromise(async _ => {
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {}
				expect(this.dialog).toHaveBeenCalledWith({
					files: this.statuses,
					lastCommit: "last commit"
				});
			});
		});
		it("should call dialog.activate()", function () {
			spyOn(this.dialog.prototype, "activate").andCallThrough();
			waitsForPromise(async _ => {
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) { console.debug(e); }
				expect(this.dialog.prototype.activate).toHaveBeenCalled();
			});
		});
	});

	describe("cancel", function () {
		beforeEach(function () {
			this.filePaths = getFilePath([files.t1]);
			this.statuses = [fileStatus("M ", files.t1)];
			this.git = mockGit({
				rootDir: Promise.resolve(getFilePath()),
				lastCommit: Promise.resolve("last commit"),
				status: Promise.resolve(this.statuses),
			});
			this.dialog = mockDialog();
		});

		it("should reject without an error", function () {
			waitsForPromise(async _ => {
				let error = true;
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {
					error = e;
				}
				expect(error).toBeFalsy();
			});
		});
	});

	fdescribe("commit", function () {
		beforeEach(function () {
			this.filePaths = getFilePath([files.t1]);
			this.git = mockGit({
				rootDir: Promise.resolve(getFilePath()),
				lastCommit: Promise.resolve("last commit"),
				status: Promise.resolve([fileStatus("M ", files.t1)]),
				add: Promise.resolve("add result"),
				commit: Promise.resolve("commit result"),
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

		it("should reject on empty message", function () {
			this.dialog = mockDialog({
				activate: Promise.resolve([
					"",
					false,
					false,
					false,
					[files.t1]
				])
			});
			waitsForPromise(async _ => {
				let error;
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {
					error = e;
				}
				expect(error).toBe("Message cannot be blank.");
			});
		});

		it("should show committing... in status bar", function () {
			spyOn(statusBar, "show").andThrow();
			waitsForPromise(async _ => {
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {}
				expect(statusBar.show).toHaveBeenCalledWith("Committing...", null);
			});
		});

		it("should call git.add", function () {
			spyOn(this.git, "add").andThrow();
			waitsForPromise(async _ => {
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {}
				expect(this.git.add).toHaveBeenCalledWith(getFilePath(), getFilePath(this.dialogReturn[4]));
			});
		});

		it("should call git.commit", function () {
			spyOn(this.git, "commit").andThrow();
			waitsForPromise(async _ => {
				try {
					await commit.command(this.filePaths, statusBar, this.git, this.dialog);
				} catch (e) {}
				expect(this.git.commit).toHaveBeenCalledWith(getFilePath(), this.dialogReturn[0], this.dialogReturn[1], getFilePath(this.dialogReturn[4]), false);
				// TODO: should check for isVerbose being correct?
			});
		});

		xit("should add a git.commit result notification", function () {
			throw "Not Implemented";
		});

		xit("should call refresh after commit", function () {
			throw "Not Implemented";
		});

		xit("should return numFiles + ' committed.'", function () {
			throw "Not Implemented";
		});
	});

	describe("commit & push", function () {

		xit("should reject on empty message", function () {
			throw "Not Implemented";
		});

		xit("should show committing... in status bar", function () {
			throw "Not Implemented";
		});

		xit("should show committing... notification", function () {
			throw "Not Implemented";
		});

		xit("should call git.add", function () {
			throw "Not Implemented";
		});

		xit("should call git.commit", function () {
			throw "Not Implemented";
		});

		xit("should add a git.commit result notification", function () {
			throw "Not Implemented";
		});

		xit("should call refresh after commit", function () {
			throw "Not Implemented";
		});

		xit("should status pushing...", function () {
			throw "Not Implemented";
		});

		xit("should info notification pushing...", function () {
			throw "Not Implemented";
		});

		xit("should git notification push result", function () {
			throw "Not Implemented";
		});

		xit("should refresh after push", function () {
			throw "Not Implemented";
		});

		xit("should return numFiles + ' committed & pushed.'", function () {
			throw "Not Implemented";
		});
	});

	describe("commit & pull & push", function () {

		xit("should reject on empty message", function () {
			throw "Not Implemented";
		});

		xit("should show committing... in status bar", function () {
			throw "Not Implemented";
		});

		xit("should show committing... notification", function () {
			throw "Not Implemented";
		});

		xit("should call git.add", function () {
			throw "Not Implemented";
		});

		xit("should call git.commit", function () {
			throw "Not Implemented";
		});

		xit("should add a git.commit result notification", function () {
			throw "Not Implemented";
		});

		xit("should call refresh after commit", function () {
			throw "Not Implemented";
		});

		xit("should set status to pulling...", function () {
			throw "Not Implemented";
		});

		xit("should display a notification pulling...", function () {
			throw "Not Implemented";
		});

		xit("should display git notification for pull results", function () {
			throw "Not Implemented";
		});

		xit("should refresh after pulling", function () {
			throw "Not Implemented";
		});

		xit("should status pushing...", function () {
			throw "Not Implemented";
		});

		xit("should notification pushing...", function () {
			throw "Not Implemented";
		});

		xit("should git notification push result", function () {
			throw "Not Implemented";
		});

		xit("should refresh after pushing", function () {
			throw "Not Implemented";
		});

		xit("should return numfiles + ' committed & pulled & pushed.'", function () {
			throw "Not Implemented";
		});

	});

});
