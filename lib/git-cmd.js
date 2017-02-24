"use babel";
/* globals atom */

import { BufferedProcess } from "atom";
import path from "path";
import fs from "fs";
import rimraf from "./rimraf";

export default {

	/**
	 * Send git command with arguments
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} args Argument list
	 * @param {string} stdin String to write to stdin
	 * @return {Promise} {string} The result of the command
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
				stdout: data => {
					output += data.toString();
				},
				stderr: data => {
					output += data.toString();
				},
				exit: code => {
					output = output.trimRight();
					if (code === 0) {
						resolve(output);
					} else {
						reject("Error code: " + code + "\n" + output);
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
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	init(cwd, verbose = false) {
		let args = ["init"];
		if (!verbose) {
			args.push("--quiet");
		}
		return this.cmd(cwd, args)
			.then(result => {
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
		const gitPath = path.join(cwd, ".git");
		return rimraf(gitPath);
	},

	/**
	 * Count commits
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {int} The result of the command
	 */
	countCommits(cwd) {
		return this.cmd(cwd, ["rev-list", "--count", "HEAD"])
			.then(result => {
				if (isNaN(+result)) {
					return Promise.reject("Commit count is not a number");
				}
				return +result;
			});
	},

	/**
	 * Add files to track
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to add
	 * @param {bool} verbose Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	add(cwd, files, verbose = false) {
		let args = ["add"];
		if (verbose) {
			args.push("--verbose");
		}
		args = args.concat(["--"], files);
		return this.cmd(cwd, args);
	},

	/**
	 * Get the root directory of the git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string} The absolute path of the root directory
	 */
	rootDir(cwd) {
		return this.cmd(cwd, ["rev-parse", "--show-toplevel"])
			.then(result => result.trimRight().replace("/", path.sep));
	},

	/**
	 * Commit files with message or amend last commit with message
	 * @param {string} cwd Current Working Directory
	 * @param {string} message The commit message.
	 * @param {bool} amend True = amend last commit, False = create new commit
	 * @param {string[]} files The files to commit
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	commit(cwd, message, amend, files, verbose = false) {
		let args = ["commit"];
		if (!verbose) {
			args.push("--quiet");
		}
		args.push("--file=-");
		if (amend) {
			args.push("--amend");
		}
		args = args.concat(["--"], files);
		return this.cmd(cwd, args, message);
	},

	/**
	 * Checkout branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to checkout
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutBranch(cwd, branch, verbose = false) {
		let args = ["checkout"];
		if (!verbose) {
			args.push("--quiet");
		}
		args.push(branch);
		return this.cmd(cwd, args);
	},

	/**
	 * Create branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to create
	 * @param {string} remote The remote branch to track
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	createBranch(cwd, branch, remote, verbose = false) {
		let args = ["checkout"];
		if (!verbose) {
			args.push("--quiet");
		}
		args = args.concat("-b", branch);
		if (remote) {
			args = args.concat("--track", remote);
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Checkout files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to checkout
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutFiles(cwd, files, verbose = false) {
		let args = ["checkout"];
		if (!verbose) {
			args.push("--quiet");
		}
		args = args.concat(["--"], files);
		return this.cmd(cwd, args);
	},

	/**
	 * Remove untracked files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to remove
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	clean(cwd, files, verbose = false) {
		let args = ["clean"];
		if (!verbose) {
			args.push("--quiet");
		}
		args = args.concat(["--force", "--"], files);
		return this.cmd(cwd, args);
	},

	/**
	 * Push commits to remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	push(cwd, verbose = false) {
		let args = ["push"];
		if (!verbose) {
			args.push("--quiet");
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Pull commits from remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	pull(cwd, verbose = false) {
		let args = ["push"];
		if (!verbose) {
			args.push("--quiet");
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Unstage files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to reset
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	unstage(cwd, files, verbose = false) {
		let args = ["reset", "HEAD"];
		if (!verbose) {
			args.push("--quiet");
		}
		args = args.concat(["--"], files);
		return this.cmd(cwd, args);
	},

	/**
	 * Undo last commit
	 * @param {string} cwd Current Working Directory
	 * @param {bool} hard Discard changes
	 * @param {int} nCommits Number of commits to undo. Default = 1
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	reset(cwd, hard = false, nCommits = 1, verbose = false) {
		nCommits = parseInt(nCommits, 10);
		if (isNaN(nCommits) || nCommits <= 0) {
			return Promise.reject("nCommits is not a number greater than 0");
		}
		let args = ["reset"];
		if (hard) {
			args.push("--hard");
		} else {
			args.push("--mixed");
		}
		if (!verbose) {
			args.push("--quiet");
		}
		args.push("HEAD~" + nCommits);
		return this.cmd(cwd, args);
	},

	/**
	 * Get last commit message
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string|null} The last commit message or null if no commits
	 */
	lastCommit(cwd) {
		return this.cmd(cwd, ["log", "-1", "--format=%B"])
			.catch(error => {
				if (error.endsWith("does not have any commits yet")) {
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
			.then(result => {
				if (result === "") {
					return [];
				}
				const files = result.trimRight().split("\n").map(line => {
					const lineMatch = line.match(/^([ MADRC?]{2}) "?(.*?)"?$/);
					if (!lineMatch) {
						return Promise.reject("git status output invalid: '" + line.replace(" ", "·") + "'");
					}
					const [, code, file] = lineMatch;
					const status = this.statusFromCode(code);
					if (status === false) {
						return Promise.reject("Unknown code '" + line.replace(" ", "·") + "'");
					}
					return {
						...status,
						file,
					};
				});
				return files;
			});
	},

	/**
	 * Get the file status from the git status code
	 * @param {string} code The code from `git status`
	 * @return {Object} {
	 *                    added: bool,
	 *                    untracked: bool,
	 *                    deleted: bool,
	 *                    changed: bool,
	 *                  }
	 */
	statusFromCode(code) {
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
				return false;
		}

		return {
			added,
			untracked,
			deleted,
			changed,
		};
	},

	/**
	 * Get repo branches
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {object[]} Repository branch names
	 */
	branches(cwd) {
		return this.cmd(cwd, ["branch", "--list", "--all"])
			.then(result => {
				if (result === "") {
					return [];
				}

				let branchNames = [];

				const branches = result.split("\n").map(line => {
					const path = line.trim();
					const selected = path.substring(0, 1) === "*";
					const name = path.replace(/^(\* )?(remotes\/origin\/)?/, "");
					if (branchNames.includes(name)) {
						return false;
					}
					branchNames.push(name);
					return {
						path,
						name,
						selected,
					};
				}).filter(el => el);

				return branches;
			});
	},

	/**
	 * Fetch from remotes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	fetch(cwd, verbose = false) {
		let args = ["fetch", "--all"];
		if (!verbose) {
			args.push("--quiet");
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Stash or unstash changes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} pop Restore the last changes that were stashed
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	stash(cwd, pop = false, verbose = false) {
		let args = ["stash"];
		if (pop) {
			args.push("pop");
		}
		if (!verbose) {
			args.push("--quiet");
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Update index and ignore/unignore changes from these files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files update
	 * @param {bool} ignore To ignore or unignore
	 * @param {bool} verbose Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	updateIndex(cwd, files, ignore = true, verbose = false) {
		let args = ["update-index"];
		if (ignore) {
			args.push("--assume-unchanged");
		} else {
			args.push("--no-assume-unchanged");
		}
		args.push("--stdin");
		if (verbose) {
			args.push("--verbose");
		}
		return this.cmd(cwd, args, files.join("\n"));
	},
};
