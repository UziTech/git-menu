/** @babel */

import pull from "../../lib/commands/pull";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, files} from "../mocks";

describe("pull", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			pull: Promise.resolve("pull result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should show pulling... in status bar", async function () {
		spyOn(statusBar, "show").and.callThrough();
		try {
			await pull.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(statusBar.show).toHaveBeenCalledWith("Pulling...", null);
	});

	it("should call git.pull", async function () {
		spyOn(this.git, "pull").and.callThrough();
		try {
			await pull.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, false);
	});

	it("should show git notification for pull results", async function () {
		spyOn(Notifications, "addGit").and.callThrough();
		try {
			await pull.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(Notifications.addGit).toHaveBeenCalledWith("Pull", "pull result");
	});

	it("should return pulled.'", async function () {
		const ret = await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret.message).toBe("Pulled.");
	});

});
