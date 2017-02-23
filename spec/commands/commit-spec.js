"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import { commit } from "../../lib/commands";
import { getFilePaths, statusBar, mockGit, mockDialog, resetGitRoot } from "../fixtures";

describe("commit", _ => {

	beforeEach(_ => {
		waitsForPromise(_ => atom.packages.activatePackage("context-git").then(_ => {
			resetGitRoot();
		}));
	});

	afterEach(_ => {
		resetGitRoot(false);
	});

	it("should call dialog with correct props", _ => {
		const filePaths = getFilePaths("/test1.txt");
		const git = mockGit(true, {
			rootDir: getFilePaths(),
			lastCommit: "last commit",
			status: [
				{
					added: true,
					untracked: false,
					deleted: false,
					changed: true,
					file: "/test1.txt"
				}
			],
		});
		const spy = {
			dialog: mockDialog(false)
		};
		spyOn(spy, "dialog").andCallThrough();
		waitsForPromise(async _ => {
			try {
				await commit.command(filePaths, statusBar, git, spy.dialog);
			} catch (e) {}
			expect(spy.dialog).toHaveBeenCalledWith({
				files: [
					{
						added: true,
						untracked: false,
						deleted: false,
						changed: true,
						file: "/test1.txt"
					}
				],
				lastCommit: "last commit"
			});
		});
	});

	// it("should reject on empty message", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should show committing... in status bar", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should show committing... notification", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should call git.add", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should call git.commit", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should add a git.commit result notification", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should call refresh after commit", _ => {
	// 	throw "Not Implemented";
	// });
	//
	// it("should add a git.commit result notification", _ => {
	// 	throw "Not Implemented";
	// });
});
