"use babel";
/* globals atom */

import { Directory } from "atom";
import discardChanges from "../../lib/commands/discard-changes";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, fileStatus, files } from "../mocks";

describe("discard-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);
		this.repo = await atom.project.repositoryForDirectory(new Directory(this.gitRoot));

		this.statuses = [fileStatus(" M", files.t1), fileStatus("??", files.t2)];
		this.filePaths = getFilePath([files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: _ => Promise.resolve(this.statuses),
			clean: Promise.resolve("clean result"),
			checkoutFiles: Promise.resolve("checkoutFiles result"),
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should call git.clean", async function () {
		spyOn(this.git, "clean").and.callThrough();
		try {
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(this.git.clean).toHaveBeenCalled();
	});

	it("should call git.checkoutFiles", async function () {
		spyOn(this.git, "checkoutFiles").and.callThrough();
		try {
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(this.git.checkoutFiles).toHaveBeenCalled();
	});

	describe("only tracked", function () {

		beforeEach(function () {
			this.statuses = [fileStatus(" M", files.t1)];
		});

		it("should not call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.clean).not.toHaveBeenCalled();
		});

		it("should call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.checkoutFiles).toHaveBeenCalled();
		});

	});

	describe("only untracked", function () {

		beforeEach(function () {
			this.statuses = [fileStatus("??", files.t1)];
		});

		it("should call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.clean).toHaveBeenCalled();
		});

		it("should not call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.checkoutFiles).not.toHaveBeenCalled();
		});

	});

	describe("reduced paths", function () {

		it("should call git.clean with ['.']", async function () {
			spyOn(this.git, "clean").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, ["."], isVerbose());
		});

		it("should call git.checkoutFiles with ['.']", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.checkoutFiles).toHaveBeenCalledWith(this.gitRoot, ["."], isVerbose());
		});

		it("should call git.clean with [files.t1]", async function () {
			this.git = mockGit({
				rootDir: Promise.resolve(this.gitRoot),
				status: (_, filePaths) => {
					if (filePaths[0] === this.gitRoot) {
						return Promise.resolve([fileStatus("??", files.t1), fileStatus("??", files.t2)]);
					}
					return Promise.resolve([fileStatus("??", files.t1)]);
				},
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});

			spyOn(this.git, "clean").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, [files.t1], isVerbose());
		});

		it("should call git.clean with ['test/']", async function () {
			this.git = mockGit({
				rootDir: Promise.resolve(this.gitRoot),
				status: (_, filePaths) => {
					if (filePaths[0] === this.gitRoot) {
						return Promise.resolve([fileStatus("??", files.t1), fileStatus("??", files.tt1)]);
					}
					return Promise.resolve([fileStatus("??", files.tt1)]);
				},
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});

			spyOn(this.git, "clean").and.callThrough();
			try {
				await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {}
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, ["test/"], isVerbose());
		});

	});

});
