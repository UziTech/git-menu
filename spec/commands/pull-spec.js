"use babel";
/* globals atom */

import { Directory } from "atom";
import pull from "../../lib/commands/pull";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, files } from "../mocks";

describe("pull", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);

		this.filePaths = getFilePath([files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			pull: Promise.resolve("pull result"),
		});
	});

	afterEach(function () {
		removeGitRoot();
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
		expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, false, isVerbose());
	});

	it("should show git notification for pull results", async function () {
		spyOn(Notifications, "addGit").and.callThrough();
		try {
			await pull.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(Notifications.addGit).toHaveBeenCalledWith("pull result");
	});

	it("should return pulled.'", async function () {
		const ret = await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret).toBe("Pulled.");
	});

});
