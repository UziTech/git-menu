/** @babel */

import sync from "../../lib/commands/sync";
import pull from "../../lib/commands/pull";
import push from "../../lib/commands/push";
import {getFilePath, removeGitRoot, createGitRoot, files} from "../mocks";

describe("sync", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.filePaths = getFilePath(this.gitRoot, [files.t1]);
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	it("should call pull and push", async function () {
		spyOn(pull, "command").and.callFake(() => Promise.resolve());
		spyOn(push, "command").and.callFake(() => Promise.resolve());
		await sync.command(this.filePaths);
		expect(pull.command.calls.mostRecent().args[0]).toEqual(this.filePaths);
		expect(push.command.calls.mostRecent().args[0]).toEqual(this.filePaths);
	});
});
