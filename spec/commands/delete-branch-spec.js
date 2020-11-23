/** @babel */

import {Directory} from "atom";
import deleteBranch from "../../lib/commands/delete-branch";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("delete-branch", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.repo = await atom.project.repositoryForDirectory(new Directory(this.gitRoot));

		this.statuses = [fileStatus("M ", files.t1), fileStatus("M ", files.t2)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.branches = [{name: "deleteBranch", selected: true}, {name: "master", selected: false}];
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			branches: Promise.resolve(this.branches),
			checkoutBranch: Promise.resolve("checkoutBranch result"),
			delete: Promise.resolve("delete result"),
			deleteBranch: Promise.resolve("deleteBranch result"),
			abort: Promise.resolve("abort result"),
		});
		this.dialogReturn = [
			{name: "deleteBranch", selected: false},
			true,
			false,
			false,
		];
		this.dialog = mockDialog({
			activate: () => Promise.resolve(this.dialogReturn),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	describe("dialog", function () {

		it("should call dialog with correct props", async function () {
			spyOn(this, "dialog").and.callThrough();
			try {
				await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				// do nothing
			}
			expect(this.dialog).toHaveBeenCalledWith({
				branches: this.branches,
				root: this.gitRoot,
			});
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.dialog.prototype.activate).toHaveBeenCalled();
		});
	});

	describe("cancel", function () {

		it("should reject without an error", async function () {
			this.dialog = mockDialog({
				activate: () => Promise.reject(),
			});
			let error;
			try {
				await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

	describe("delete", function () {
		it("should return on not local or remote", async function () {
			spyOn(this.git, "deleteBranch").and.callThrough();
			this.dialogReturn[1] = false;
			expect(this.git.deleteBranch).not.toHaveBeenCalled();
		});

		it("should show deleting branch... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(statusBar.show).toHaveBeenCalledWith("Deleting Branch...");
		});

		it("should not call git.checkoutBranch if root branch is not selected", async function () {
			spyOn(this.git, "checkoutBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).not.toHaveBeenCalled();
		});

		it("should call git.checkoutBranch if root branch is selected", async function () {
			this.dialogReturn[0].selected = true;
			spyOn(this.git, "checkoutBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).toHaveBeenCalledWith(this.gitRoot, "master");
		});

		it("should call git.deleteBranch with force", async function () {
			this.dialogReturn[2] = true;
			this.dialogReturn[3] = true;
			spyOn(this.git, "deleteBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, false, true);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, true, true);
		});

		it("should call git.deleteBranch on local", async function () {
			this.dialogReturn[1] = true;
			this.dialogReturn[2] = false;
			spyOn(this.git, "deleteBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, false, false);
			expect(this.git.deleteBranch).toHaveBeenCalledTimes(1);
		});

		it("should call git.deleteBranch on remote", async function () {
			this.dialogReturn[1] = false;
			this.dialogReturn[2] = true;
			spyOn(this.git, "deleteBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, true, false);
			expect(this.git.deleteBranch).toHaveBeenCalledTimes(1);
		});

		it("should call git.deleteBranch on local and remote", async function () {
			this.dialogReturn[1] = true;
			this.dialogReturn[2] = true;
			spyOn(this.git, "deleteBranch").and.callThrough();
			await deleteBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, true, false);
			expect(this.git.deleteBranch).toHaveBeenCalledWith(this.gitRoot, this.dialogReturn[0].name, false, false);
			expect(this.git.deleteBranch).toHaveBeenCalledTimes(2);
		});
	});
});
