"use babel";
/* globals atom */

import path from "path";
import fs from "fs";
import { rimrafSync } from "../lib/rimraf";
import gitCmd from "../lib/git-cmd";
import StatusBarManager from "../lib/widgets/StatusBarManager";

export const statusBar = new StatusBarManager({ addRightTile() {} });

/**
 * Mock statuses for files
 * @param  {string} code The git status code
 * @param  {string} file The file
 * @return {Object} {
 *                    added: bool,
 *                    untracked: bool,
 *                    deleted: bool,
 *                    changed: bool,
 *                    file: string
 *                  }
 */
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

/**
 * Files in spec/git-root
 * @type {Object}
 */
export const files = {
	t1: "test1.txt",
	t2: "test2.txt",
	tt1: "test/test1.txt",
	tt2: "test/test2.txt",
};

/**
 * Mock a dialog
 * @param  {Object} [methods={ methods: Promise, ... }] The methods to add to the mock
 * @return {class} A dialog class
 */
export function mockDialog(methods = { activate: _ => Promise.reject() }) {
	let dialog = function () {};
	Object.keys(methods)
		.forEach(method => {
			dialog.prototype[method] = _ => {
				if (typeof methods[method] === "function") {
					return methods[method]();
				}
				return methods[method];
			};
		});
	return dialog;
}

/**
 * Mock git-cmd
 * @param  {Object} [methods={ methods: Promise, ... }] The methods to add to the mock
 * @return {Object} An object with the methods provided
 */
export function mockGit(methods = {}) {
	return Object.keys(methods)
		.reduce((prev, method) => {
			prev[method] = _ => {
				if (typeof methods[method] === "function") {
					return methods[method]();
				}
				return methods[method];
			};
			return prev;
		}, {});
};

/**
 * Remove the test spec/git-root directory
 * @return {void}
 */
export function removeGitRoot() {
	rimrafSync(getFilePath());
}

/**
 * Create the test spec/git-root directory
 * @return {void}
 */
export function createGitRoot() {
	if (fs.existsSync(getFilePath())) {
		removeGitRoot();
	}
	getFilePath(["/", "/test"])
		.forEach(dir => {
			fs.mkdirSync(dir);
		});
	getFilePath(["/test1.txt", "/test2.txt", "/test/test1.txt", "/test/test2.txt"])
		.forEach(file => {
			fs.closeSync(fs.openSync(file, "w"));
		});
};

/**
 * Get path to file(s) in spec/git-root directory
 * @param  {string|string[]} paths the path or paths to get
 * @return {string|string[]} If input is an array it will return an array
 */
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
