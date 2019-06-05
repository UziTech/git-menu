/** @babel */

import fetch from "../../lib/commands/fetch";
import Notifications from "../../lib/Notifications";
import {getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, files} from "../mocks";

describe("fetch", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			fetch: Promise.resolve("fetch result"),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should show fetching... in status bar", async function () {
		spyOn(statusBar, "show").and.callThrough();
		await fetch.command(this.filePaths, statusBar, this.git, Notifications);
		expect(statusBar.show).toHaveBeenCalledWith("Fetching...");
	});

	it("should call git.fetch", async function () {
		spyOn(this.git, "fetch").and.callThrough();
		await fetch.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.fetch).toHaveBeenCalledWith(this.gitRoot);
	});

	it("should show git notification for fetch results", async function () {
		spyOn(Notifications, "addGit").and.callThrough();
		await fetch.command(this.filePaths, statusBar, this.git, Notifications);
		expect(Notifications.addGit).toHaveBeenCalledWith("Fetch", "fetch result");
	});

	it("should return fetched.'", async function () {
		const ret = await fetch.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret.message).toBe("Fetched.");
	});

});
