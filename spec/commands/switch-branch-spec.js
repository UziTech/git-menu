/** @babel */

import {Directory} from "atom";
import switchBranch from "../../lib/commands/switch-branch";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("switch-branch", function () {

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
			createBranch: Promise.resolve("createBranch result"),
		});
		this.dialogReturn = [
			"repo",
			"remote",
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
				await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
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
			await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
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
				await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

	describe("switch", function () {

		it("should show switching branch... in status bar", async function () {
			spyOn(statusBar, "show").and.callThrough();
			await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(statusBar.show).toHaveBeenCalledWith("Switching Branch...");
		});

		it("should call git.createBranch if remote is not null", async function () {
			spyOn(this.git, "checkoutBranch").and.callThrough();
			spyOn(this.git, "createBranch").and.callThrough();
			await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).not.toHaveBeenCalled();
			expect(this.git.createBranch).toHaveBeenCalled();
		});

		it("should call git.checkoutBranch if remote is null", async function () {
			this.dialogReturn[1] = null;
			spyOn(this.git, "checkoutBranch").and.callThrough();
			spyOn(this.git, "createBranch").and.callThrough();
			await switchBranch.command(this.filePaths, statusBar, this.git, Notifications, this.dialog);
			expect(this.git.checkoutBranch).toHaveBeenCalled();
			expect(this.git.createBranch).not.toHaveBeenCalled();
		});
	});
});
