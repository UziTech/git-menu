/** @babel */

import {Directory} from "atom";
import mergeBranch from "../../lib/commands/merge-branch";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("merge-branch", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.repo = await atom.project.repositoryForDirectory(new Directory(this.gitRoot));

		this.statuses = [fileStatus("M ", files.t1), fileStatus("M ", files.t2)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			branches: Promise.resolve("branches result"),
			checkoutBranch: Promise.resolve("checkoutBranch result"),
			merge: Promise.resolve("merge result"),
			deleteBranch: Promise.resolve("deleteBranch result"),
		});
		this.dialogReturn = [
			{name: "rootBranch", selected: true},
			{name: "mergeBranch", selected: false},
			false,
		];
		this.dialog = mockDialog({
			activate: () => Promise.resolve(this.dialogReturn)
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	describe("dialog", function () {

		it("should call dialog with correct props", async function () {
			spyOn(this, "dialog").and.callThrough();
			try {
				await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				// do nothing
			}
			expect(this.dialog).toHaveBeenCalledWith({
				branches: "branches result",
				root: this.gitRoot,
			});
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
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
				await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

	describe("merge", function () {

		it("should reject on same branch", async function () {
			// eslint-disable-next-line prefer-destructuring
			this.dialogReturn[0] = this.dialogReturn[1];
			let error;
			try {
				await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = ex;
			}
			expect(error).toBe("Branches cannot be the same.");
		});

		it("should show merging branch... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(statusBar.show).toHaveBeenCalledWith("Merging Branch...");
		});

		it("should not call git.checkoutBranch if root branch is selected", async function () {
			spyOn(this.git, "checkoutBranch").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).not.toHaveBeenCalled();
		});

		it("should call git.checkoutBranch if root branch not selected", async function () {
			this.dialogReturn[0].selected = false;
			spyOn(this.git, "checkoutBranch").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name);
		});

		it("should call git.merge", async function () {
			spyOn(this.git, "merge").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.merge).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[1].name);
		});

		it("should call git.deleteBranch", async function () {
			this.dialogReturn[2] = true;
			spyOn(this.git, "deleteBranch").and.callThrough();
			await mergeBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[1].name);
		});
	});
});
