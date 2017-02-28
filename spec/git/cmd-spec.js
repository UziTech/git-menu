"use babel";
/* globals atom, describe, it, expect, beforeEach, afterEach, waitsForPromise, runs, spyOn, jasmine */

import { Directory } from "atom";
import gitCmd from "../../lib/git-cmd";
import Notifications, { isVerbose } from "../../lib/Notifications";
import { getFilePath, statusBar, mockGit, mockDialog, removeGitRoot, createGitRoot, fileStatus, files } from "../fixtures";

describe("git.cmd", function () {

	beforeEach(function () {
		waitsForPromise(async _ => {
			await atom.packages.activatePackage("context-git");
			createGitRoot();
			this.gitRoot = getFilePath();
			atom.project.setPaths([this.gitRoot]);
		});
	});

	afterEach(function () {
		removeGitRoot();
	});

	it("should call git", function () {
		waitsForPromise(async _ => {
			let error;
			try {
				await gitCmd.cmd(this.getRoot);
			} catch (ex) {
				error = ex;
			}
			expect(error).toContain("usage: git [--version]");
		});
	});

	it("should call git with the args", function () {
		waitsForPromise(async _ => {
			let error;
			try {
				await gitCmd.cmd(this.getRoot, ["test"]);
			} catch (ex) {
				error = ex;
			}
			expect(error).toContain("git: 'test' is not a git command.");
		});
	});

	it("should reject on error", function () {
		waitsForPromise(async _ => {
			let rejected = false;
			let resolved = false;
			try {
				await gitCmd.cmd(this.getRoot, ["test"]);
				resolved = true;
			} catch (ex) {
				rejected = true;
			}
			expect(rejected).toBeTruthy();
			expect(resolved).toBeFalsy();
		});
	});

	it("should resolve on non-error", function () {
		waitsForPromise(async _ => {
			let rejected = false;
			let resolved = false;
			try {
				await gitCmd.cmd(this.getRoot, ["init"]);
				resolved = true;
			} catch (ex) {
				rejected = true;
			}
			expect(rejected).toBeFalsy();
			expect(resolved).toBeTruthy();
		});
	});

});
