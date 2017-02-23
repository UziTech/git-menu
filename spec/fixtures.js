"use babel";
/* globals atom */

import path from "path";
import fs from "fs";
import { rimrafSync } from "../lib/rimraf";
import gitCmd from "../lib/git-cmd";
import StatusBarManager from "../lib/widgets/StatusBarManager";

export const statusBar = new StatusBarManager({ addRightTile() {} });

export function mockDialog(passing = true, resolveVal = {}) {
	return function () {
		this.activate = _ => (passing ? Promise.resolve(resolveVal.activate) : Promise.reject(resolveVal.activate));
	};
}


export function mockGit(passing = true, resolveVal = {}) {
	return Object.keys(gitCmd).reduce((prev, key) => {
		prev[key] = _ => (passing ? Promise.resolve(resolveVal[key]) : Promise.reject(resolveVal[key]));
		return prev;
	}, {});
};

export function resetGitRoot(create = true) {
	rimrafSync(getFilePaths()[0]);
	if (create) {
		getFilePaths("/", "/test").forEach(dir => {
			fs.mkdirSync(dir);
		});
		getFilePaths("/test1.txt", "/test2.txt", "/test/test1.txt", "/test/test2.txt").forEach(file => {
			fs.closeSync(fs.openSync(file, "w"));
		});
	}
};

export function getFilePaths(...paths) {
	if (paths.length === 0) {
		paths = ["/"];
	}
	const gitRoot = path.join(atom.packages.resolvePackagePath("context-git"), "spec/git-root");
	return paths.map(p => path.join(gitRoot, p));
};
