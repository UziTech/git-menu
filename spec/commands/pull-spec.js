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
		await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(statusBar.show).toHaveBeenCalledWith("Pulling...");
	});

	it("should call git.pull", async function () {
		spyOn(this.git, "pull").and.callThrough();
		await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, false, false);
	});

	it("should call git.pull with rebase config", async function () {
		spyOn(this.git, "pull").and.callThrough();
		atom.config.set("git-menu.rebaseOnPull", true);
		await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(this.git.pull).toHaveBeenCalledWith(this.gitRoot, true, false);
	});

	it("should show git notification for pull results", async function () {
		spyOn(Notifications, "addGit").and.callThrough();
		await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(Notifications.addGit).toHaveBeenCalledWith("Pull", "pull result");
	});

	it("should return pulled.'", async function () {
		const ret = await pull.command(this.filePaths, statusBar, this.git, Notifications);
		expect(ret.message).toBe("Pulled.");
	});

});
