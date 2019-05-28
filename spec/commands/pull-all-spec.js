/** @babel */

import pullAll from "../../lib/commands/pull-all";
import pull from "../../lib/commands/pull";
import {removeGitRoot, createGitRoot} from "../mocks";

describe("pull-all", function () {

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

	it("should call pull with project folders", async function () {
		spyOn(pull, "command").and.callFake(() => Promise.resolve());
		await pullAll.command();
		expect(pull.command).toHaveBeenCalledTimes(2);
		expect(pull.command.calls.argsFor(0)[0]).toEqual(this.gitRoot1);
		expect(pull.command.calls.argsFor(1)[0]).toEqual(this.gitRoot2);
	});
});
