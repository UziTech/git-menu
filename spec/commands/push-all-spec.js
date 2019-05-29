/** @babel */

import pushAll from "../../lib/commands/push-all";
import push from "../../lib/commands/push";
import {removeGitRoot, createGitRoot} from "../mocks";

describe("push-all", function () {

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

	it("should call push with project folders", async function () {
		spyOn(push, "command").and.callFake(() => Promise.resolve());
		await pushAll.command();
		expect(push.command).toHaveBeenCalledTimes(2);
		expect(push.command.calls.argsFor(0)[0]).toEqual([this.gitRoot1]);
		expect(push.command.calls.argsFor(1)[0]).toEqual([this.gitRoot2]);
	});
});
