/** @babel */

import log from "../../lib/commands/log";
import {getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, files} from "../mocks";

describe("log", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			cmd: Promise.resolve("cmd result"),
		});
		this.dialog = mockDialog({
			activate: Promise.resolve()
		});
		this.format = atom.config.get("git-menu.logFormat");
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	describe("dialog", function () {

		it("should call dialog with correct props", async function () {
			spyOn(this, "dialog").and.callThrough();
			try {
				await log.command(this.filePaths, statusBar, this.git, null, this.dialog);
			} catch (ex) {}
			expect(this.dialog).toHaveBeenCalledWith(jasmine.objectContaining({
				root: this.gitRoot,
				gitCmd: jasmine.any(Object),
				format: this.format,
			}));
		});

		it("should call dialog.activate()", async function () {
			spyOn(this.dialog.prototype, "activate").and.callThrough();
			try {
				await log.command(this.filePaths, statusBar, this.git, null, this.dialog);
			} catch (ex) {}
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
				await log.command(this.filePaths, statusBar, this.git, null, this.dialog);
			} catch (ex) {
				error = !ex;
			}
			expect(error).toBeTruthy();
		});
	});

});
