"use babel";
/* globals atom */

import { Directory } from "atom";
import push from "../../lib/commands/push";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, removeGitRoot, createGitRoot, files } from "../mocks";

describe("push", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("context-git");
		createGitRoot();
		this.gitRoot = getFilePath();
		atom.project.setPaths([this.gitRoot]);

		this.filePaths = getFilePath([files.t1]);
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			push: Promise.resolve("push result"),
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should show pushing... in status bar", async function () {
		spyOn(statusBar, "show").and.callThrough();
		try {
			await push.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(statusBar.show).toHaveBeenCalledWith("Pushing...", null);
	});

	it("should call git.push", async function () {
		spyOn(this.git, "push").and.callThrough();
		try {
			await push.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(this.git.push).toHaveBeenCalledWith(this.gitRoot, false, isVerbose());
	});

	it("should show git notification for push results", async function () {
		spyOn(Notifications, "addGit").and.callThrough();
		try {
			await push.command(this.filePaths, statusBar, this.git, Notifications);
		} catch (ex) {}
		expect(Notifications.addGit).toHaveBeenCalledWith("push result");
	});

	it("should return pushed.'", async function () {
		const ret = await push.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret).toBe("Pushed.");
	});

});
