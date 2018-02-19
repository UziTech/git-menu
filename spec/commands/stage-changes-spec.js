/** @babel */

import stageChanges from "../../lib/commands/stage-changes";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("stage-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		this.gitRoot = await createGitRoot();

		this.statuses = [fileStatus("M ", files.t1), fileStatus("??", files.t2)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: () => Promise.resolve(this.statuses),
			add: Promise.resolve("add result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call git.add", async function () {
		spyOn(this.git, "add").and.callThrough();
		try {
			await stageChanges.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(this.git.add).toHaveBeenCalled();
	});

	describe("no staged changes", function () {

		beforeEach(function () {
			this.git = mockGit({
				status: () => {
					return Promise.resolve([fileStatus(" M", files.t1)]);
				}
			});
		});

		it("should throw an error", async function () {
			spyOn(this.git, "add").and.callThrough();
			let error = false;
			try {
				await stageChanges.command(this.filePaths, statusBar, this.git, Notifications);
			} catch (ex) {
				error = ex;
			}
			expect(error).toBeTruthy();
			expect(this.git.add).not.toHaveBeenCalled();
		});

	});

});
