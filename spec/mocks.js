/** @babel */

import path from "path";
import fs from "fs";
import gitCmd from "../lib/git-cmd";
import StatusBarManager from "../lib/widgets/StatusBarManager";
import {promisify} from "promisificator";
import temp from "temp";
temp.track();

export const statusBar = new StatusBarManager({addRightTile() {}});

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
		throw new Error(`Invalid code '${code}'`);
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
export function mockDialog(methods = {activate: () => Promise.reject()}) {
	const dialog = Object.keys(methods).reduce((prev, method) => {
		prev.prototype[method] = function (...args) {
			if (typeof methods[method] === "function") {
				return methods[method].apply(dialog, args);
			}
			return methods[method];
		};
		return prev;
	}, function () {});
	return dialog;
}

/**
 * Mock git-cmd
 * @param  {Object} [methods={ methods: Promise, ... }] The methods to add to the mock
 * @return {Object} An object with the methods provided
 */
export function mockGit(methods = {}) {
	const mock = Object.keys(gitCmd).reduce((prev, method) => {
		prev[method] = () => Promise.resolve();
		return prev;
	}, {});

	Object.keys(methods).forEach(method => {
		mock[method] = function (...args) {
			if (typeof methods[method] === "function") {
				return methods[method].apply(mock, args);
			}
			return methods[method];
		};
	});

	return mock;
};

/**
 * Remove the test spec/git-root directory
 * @param  {string} root The root path
 * @return {void}
 */
export async function removeGitRoot(root) {
	try {
		const pathWatcher = await atom.project.getWatcherPromise(root);
		await pathWatcher.native.stop();
		pathWatcher.dispose();
		await promisify(temp.cleanup)();
	} catch (ex) {
		console.error(ex);
	}
}

/**
 * Get path to file(s) in spec/git-root directory
 * @param  {string} root The root path
 * @param  {string|string[]} paths The path or paths to get
 * @return {string|string[]} If input is an array it will return an array
 */
export function getFilePath(root, paths) {
	const isArray = Array.isArray(paths);
	if (!paths) {
		// eslint-disable-next-line no-param-reassign
		paths = ["/"];
	} else if (!isArray) {
		// eslint-disable-next-line no-param-reassign
		paths = [paths];
	}
	const fullPaths = paths.map(p => path.join(root, p));

	return (isArray ? fullPaths : fullPaths[0]);

};

/**
 * Create the test spec/git-root directory
 * @param  {bool} init initialize a git repo (default: true)
 * @return {void}
 */
export async function createGitRoot(init = true) {
	try {
		const root = await promisify(temp.mkdir)("git-root-");
		const dirs = getFilePath(root, ["/test"]);
		const filePaths = getFilePath(root, ["/test1.txt", "/test2.txt", "/test/test1.txt", "/test/test2.txt"]);

		for (const dir of dirs) {
			await promisify(fs.mkdir)(dir);
		}
		for (const file of filePaths) {
			await promisify(fs.open)(file, "w").then(fd => promisify(fs.close)(fd));
		}

		if (init) {
			await gitCmd.init(root);
		}

		atom.project.setPaths([root]);

		return root;
	} catch (ex) {
		console.error(ex);
	}
};
