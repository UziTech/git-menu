/** @babel */

import ignoreChanges from "../../lib/commands/ignore-changes";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, fileStatus, files} from "../mocks";

describe("ignore-changes", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.statuses = [fileStatus(" M", files.t1), fileStatus("??", files.t2)];
		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: () => Promise.resolve(this.statuses),
			updateIndex: Promise.resolve("updateIndex result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call git.updateIndex", async function () {
		spyOn(this.git, "updateIndex").and.callThrough();
		await ignoreChanges.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.updateIndex).toHaveBeenCalled();
	});

});
