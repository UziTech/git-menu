"use babel";
/* globals atom */

import path from "path";
import fs from "fs";
import { rimrafSync } from "../lib/rimraf";
import gitCmd from "../lib/git-cmd";
import StatusBarManager from "../lib/widgets/StatusBarManager";

export const statusBar = new StatusBarManager({ addRightTile() {} });

export function fileStatus(code, file) {
	const status = gitCmd.statusFromCode(code);
	if (status === false) {
		throw new Error("Invalid code '" + code + "'");
	}
	return {
		...status,
		file,
	};
}

export const files = {
	t1: "test1.txt",
	t2: "test2.txt",
	tt1: "test/test1.txt",
	tt2: "test/test2.txt",
};

/**
 * Mock a dialog
 * @param  {Object} [methods={ methods: Promise.[resolve|reject](value), ... }] The methods to add to the mock
 * @return {class} A dialog class
 */
export function mockDialog(methods = { activate: Promise.reject() }) {
	let dialog = function () {};
	Object.keys(methods).forEach(method => {
		dialog.prototype[method] = _ => methods[method];
	});
	return dialog;
}

/**
 * Mock git-cmd
 * @param  {Object} [methods={ methods: Promise.[resolve|reject](value), ... }] The methods to add to the mock
 * @return {Object} An object with the methods provided
 */
export function mockGit(methods = {}) {
	return Object.keys(methods).reduce((prev, method) => {
		prev[method] = _ => methods[method];
		return prev;
	}, {});
};

export function removeGitRoot() {
	rimrafSync(getFilePath());
}

export function createGitRoot() {
	if (fs.existsSync(getFilePath())) {
		removeGitRoot();
	}
	getFilePath(["/", "/test"]).forEach(dir => {
		fs.mkdirSync(dir);
	});
	getFilePath(["/test1.txt", "/test2.txt", "/test/test1.txt", "/test/test2.txt"]).forEach(file => {
		fs.closeSync(fs.openSync(file, "w"));
	});
};

export function getFilePath(paths) {
	const isArray = Array.isArray(paths);
	if (!paths) {
		paths = ["/"];
	} else if (!isArray) {
		paths = [paths];
	}
	const gitRoot = path.join(atom.packages.resolvePackagePath("context-git"), "spec/git-root");
	const fullPaths = paths.map(p => path.join(gitRoot, p));

	return (isArray ? fullPaths : fullPaths[0]);

};
