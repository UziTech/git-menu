/** @babel */

import fetchAll from "../../lib/commands/fetch-all";
import fetch from "../../lib/commands/fetch";
import {removeGitRoot, createGitRoot} from "../mocks";

describe("fetch-all", function () {

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

	it("should call fetch with project folders", async function () {
		spyOn(fetch, "command").and.callFake(() => Promise.resolve());
		await fetchAll.command();
		expect(fetch.command).toHaveBeenCalledTimes(2);
		expect(fetch.command.calls.argsFor(0)[0]).toEqual(this.gitRoot1);
		expect(fetch.command.calls.argsFor(1)[0]).toEqual(this.gitRoot2);
	});
});
