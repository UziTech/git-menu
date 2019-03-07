/** @babel */

import discardChanges from "../../lib/commands/discard-changes";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("discard-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.statuses = [fileStatus(" M", files.t1), fileStatus("??", files.t2)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: () => Promise.resolve(this.statuses),
			unstage: Promise.resolve("unstage result"),
			clean: Promise.resolve("clean result"),
			checkoutFiles: Promise.resolve("checkoutFiles result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call git.clean", async function () {
		spyOn(this.git, "clean").and.callThrough();
		await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.clean).toHaveBeenCalled();
	});

	it("should call git.checkoutFiles", async function () {
		spyOn(this.git, "checkoutFiles").and.callThrough();
		await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.checkoutFiles).toHaveBeenCalled();
	});

	describe("no tracked selected", function () {

		beforeEach(function () {
			this.git = mockGit({
				rootDir: Promise.resolve(this.gitRoot),
				status: (_, filePaths) => {
					if (filePaths[0] === this.gitRoot) {
						return Promise.resolve([fileStatus("??", files.t1), fileStatus(" M", files.t2)]);
					}
					return Promise.resolve([fileStatus("??", files.t1)]);
				},
				unstage: Promise.resolve("unstage result"),
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});
		});

		it("should call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).toHaveBeenCalled();
		});

		it("should not call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.checkoutFiles).not.toHaveBeenCalled();
		});

	});

	describe("only tracked", function () {

		beforeEach(function () {
			this.statuses = [fileStatus(" M", files.t1)];
		});

		it("should not call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).not.toHaveBeenCalled();
		});

		it("should call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.checkoutFiles).toHaveBeenCalled();
		});

	});

	describe("no untracked selected", function () {

		beforeEach(function () {
			this.git = mockGit({
				rootDir: Promise.resolve(this.gitRoot),
				status: (_, filePaths) => {
					if (filePaths[0] === this.gitRoot) {
						return Promise.resolve([fileStatus(" M", files.t1), fileStatus("??", files.t2)]);
					}
					return Promise.resolve([fileStatus(" M", files.t1)]);
				},
				unstage: Promise.resolve("unstage result"),
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});
		});

		it("should not call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).not.toHaveBeenCalled();
		});

		it("should call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.checkoutFiles).toHaveBeenCalled();
		});

	});

	describe("only untracked", function () {

		beforeEach(function () {
			this.statuses = [fileStatus("??", files.t1)];
		});

		it("should call git.clean", async function () {
			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).toHaveBeenCalled();
		});

		it("should not call git.checkoutFiles", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.checkoutFiles).not.toHaveBeenCalled();
		});

	});

	describe("reduced paths", function () {

		it("should call git.clean with ['.']", async function () {
			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, ["."]);
		});

		it("should call git.checkoutFiles with ['.']", async function () {
			spyOn(this.git, "checkoutFiles").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.checkoutFiles).toHaveBeenCalledWith(this.gitRoot, ["."]);
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
				unstage: Promise.resolve("unstage result"),
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});

			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, [files.t1]);
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
				unstage: Promise.resolve("unstage result"),
				clean: Promise.resolve("clean result"),
				checkoutFiles: Promise.resolve("checkoutFiles result"),
			});

			spyOn(this.git, "clean").and.callThrough();
			await discardChanges.command(this.filePaths, statusBar, this.git, Notifications);
			expect(this.git.clean).toHaveBeenCalledWith(this.gitRoot, ["test/"]);
		});

	});

});
