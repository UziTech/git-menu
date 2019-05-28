/** @babel */

import syncAll from "../../lib/commands/sync-all";
import sync from "../../lib/commands/sync";
import {removeGitRoot, createGitRoot} from "../mocks";

describe("sync-all", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot1 = await createGitRoot();
		this.gitRoot2 = await createGitRoot();
		atom.project.setPaths([this.gitRoot1, this.gitRoot2]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot1);
		await removeGitRoot(this.gitRoot2);
	});

	it("should call sync with project folders", async function () {
		spyOn(sync, "command").and.callFake(() => Promise.resolve());
		await syncAll.command();
		expect(sync.command).toHaveBeenCalledTimes(2);
		expect(sync.command.calls.argsFor(0)[0]).toEqual(this.gitRoot1);
		expect(sync.command.calls.argsFor(1)[0]).toEqual(this.gitRoot2);
	});
});
