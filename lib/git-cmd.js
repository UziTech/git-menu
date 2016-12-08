"use babel";
/* globals atom */

import {
	BufferedProcess,
} from "atom";
import path from "path";
import fs from "fs";

export default {

	/**
	 * Send git command with arguments
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} args Argument list
	 * @param {string} stdin String to write to stdin
	 * @return {Promise} Will resolve to the result of the command
	 */
	cmd(cwd, args = [], stdin = "") {
		return new Promise((resolve, reject) => {
			let output = "";
			const bp = new BufferedProcess({
				command: atom.config.get("context-git.gitPath"),
				args: args,
				options: {
					cwd: cwd,
					env: process.env
				},
				stdout: (data) => {
					output += data.toString();
				},
				stderr: (data) => {
					output += data.toString();
				},
				exit: (code) => {
					if (code === 0) {
						resolve(output);
					} else {
						reject(output);
					}
				}
			});
			if (stdin) {
				bp.process.stdin.write(stdin);
			}
			bp.process.stdin.end();
		});
	},

	/**
	 * Initialize a git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} void
	 */
	init(cwd) {
		return this.cmd(cwd, ["init", "--quiet"])
			.then((result) => {
				if (result !== "") {
					console.log("git init result:", result.trimRight());
				}
			});
	},

	/**
	 * Remove the git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} void
	 */
	remove(cwd) {
		return new Promise((resolve, reject) => {
			const gitPath = path.join(cwd, ".git");
			var deleteFolderRecursive = function (dir) {
				if (fs.existsSync(dir)) {
					fs.readdirSync(dir).forEach(function (file, index) {
						var curPath = path.join(dir, file);
						if (fs.lstatSync(curPath).isDirectory()) {
							deleteFolderRecursive(curPath);
						} else {
							fs.unlinkSync(curPath);
						}
					});
					fs.rmdirSync(dir);
				}
			};
			deleteFolderRecursive(gitPath);
			resolve();
		});
	},

	/**
	 * Count commits
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} void
	 */
	countCommits(cwd) {
		return this.cmd(cwd, ["rev-list", "--count", "HEAD"])
			.then((result) => {
				// TODO: check the result is a number?
				return result;
			});
	},

	/**
	 * Add files to track
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to add
	 * @return {Promise} void
	 */
	add(cwd, files) {
		return this.cmd(cwd, ["add", "--", ...files])
			.then((result) => {
				if (result !== "") {
					console.log("git add result:", result.trimRight());
				}
			});
	},

	/**
	 * Get the root directory of the git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} Will resolve to the absolute path of the root directory
	 */
	rootDir(cwd) {
		return this.cmd(cwd, ["rev-parse", "--show-toplevel"])
			.then((result) => {
				return result.trimRight().replace("/", path.sep);
			});
	},

	/**
	 * Commit files with message or amend last commit with message
	 * @param {string} cwd Current Working Directory
	 * @param {string} message The commit message.
	 * @param {bool} amend True = amend last commit, False = create new commit
	 * @param {string[]} files The files to commit
	 * @return {Promise} void
	 */
	commit(cwd, message, amend, files) {
		let args = ["commit", "--quiet", "--file=-"];
		if (amend) {
			args.push("--amend");
		}
		args = args.concat(["--"], files);
		return this.cmd(cwd, args, message)
			.then((result) => {
				if (result !== "") {
					console.log("git commit result:", result.trimRight());
				}
			});
	},

	/**
	 * Checkout files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to checkout
	 * @return {Promise} void
	 */
	checkout(cwd, files) {
		return this.cmd(cwd, ["checkout", "--quiet", "--", ...files])
			.then((result) => {
				if (result !== "") {
					console.log("git checkout result:", result.trimRight());
				}
			});
	},

	/**
	 * Remove untracked files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to remove
	 * @return {Promise} void
	 */
	clean(cwd, files) {
		return this.cmd(cwd, ["clean", "--quiet", "--force", "--", ...files])
			.then((result) => {
				if (result !== "") {
					console.log("git checkout result:", result.trimRight());
				}
			});
	},

	/**
	 * Push commits to remote repo
	 * @param  {string} cwd Current Working Directory
	 * @return {Promise} void
	 */
	push(cwd) {
		return this.cmd(cwd, ["push", "--quiet"])
			.then((result) => {
				if (result !== "") {
					console.log("git push result:", result.trimRight());
				}
			});
	},

	/**
	 * Pull commits from remote repo
	 * @param  {string} cwd Current Working Directory
	 * @return {Promise} void
	 */
	pull(cwd) {
		return this.cmd(cwd, ["pull", "--quiet"])
			.then((result) => {
				if (result !== "") {
					console.log("git pull result:", result.trimRight());
				}
			});
	},

	/**
	 * Unstage files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to reset
	 * @return {Promise} void
	 */
	unstage(cwd, files) {
		return this.cmd(cwd, ["reset", "HEAD", "--quiet", "--", ...files])
			.then((result) => {
				if (result !== "") {
					throw result.trimRight();
				}
			});
	},

	/**
	 * Undo last commit
	 * @param {string} cwd Current Working Directory
	 * @param {bool} hard Discard changes
	 * @param {int} nCommits Number of commits to undo. Default = 1
	 * @return {Promise} void
	 */
	reset(cwd, hard, nCommits = 1) {
		nCommits = parseInt(nCommits, 10);
		if (isNaN(nCommits) || nCommits <= 0) {
			throw "nCommits is not a number greater than 0";
		}
		return this.cmd(cwd, ["reset", (hard ? "--hard" : "--mixed"), "--quiet", "HEAD~" + nCommits])
			.then((result) => {
				if (result !== "") {
					throw result.trimRight();
				}
			});
	},

	/**
	 * Get last commit message
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string} The message
	 */
	lastCommit(cwd) {
		return this.cmd(cwd, ["log", "-1", "--format=%B"])
			.then((result) => {
				return result.trimRight();
			})
			.catch((error) => {
				if (error.trimRight().endsWith("does not have any commits yet")) {
					return null;
				}
				return Promise.reject(error);
			});
	},

	/**
	 * Get the status on changed files
	 * @param {string} cwd Current Working Directory
	 * @param {string} filePaths The directorys or files to check
	 * @return {Promise} {object[]} Status objects
	 *                        [
	 *                          {
	 *                            added: bool,
	 *                            untracked: bool,
	 *                            deleted: bool,
	 *                            changed: bool,
	 *                            file: string,
	 *                          }, ...
	 *                        ]
	 */
	status(cwd, filePaths) {
		return this.cmd(cwd, ["status", "--porcelain", "--untracked-files=all", ...filePaths])
			.then((result) => {
				if (result === "") {
					return [];
				}
				const files = result.trimRight().split("\n").map((line) => {
					const lineMatch = line.match(/^([ MADRC?]{2}) "?(.*?)"?$/);
					if (!lineMatch) {
						throw "git status output invalid: '" + line.replace(" ", "·") + "'";
					}
					const [, code, file] = lineMatch;
					let added = false;
					let untracked = false;
					let deleted = false;
					let changed = false;
					switch (code) {
						case "M ":
						case "MM":
						case "MD":
							added = true;
							changed = true;
							break;
						case " M":
							changed = true;
							break;
						case "D ":
						case "DD":
						case "DM":
							added = true;
							deleted = true;
							break;
						case " D":
							deleted = true;
							break;
						case "A ":
						case "A?":
						case "AM":
						case "AD":
						case "R ":
						case "RM":
						case "RD":
							added = true;
							untracked = true;
							break;
						case "??":
							untracked = true;
							break;
						default:
							throw "Unknown code: '" + line.replace(" ", "·") + "'";
					}

					return {
						added,
						untracked,
						deleted,
						changed,
						file,
					};
				});
				return files;
			});
	},
};
