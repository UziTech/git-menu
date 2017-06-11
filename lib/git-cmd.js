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
	 * @param {string[]} [args=[]] Argument list. Any empty strings will be removed.
	 * @param {string} [stdin=""] String to write to stdin
	 * @return {Promise} {string} The result of the command
	 */
	cmd(cwd, args = [], stdin = "") {
		return new Promise((resolve, reject) => {
			let output = "";
			const bp = new BufferedProcess({
				command: atom.config.get("context-git.gitPath"),
				args: args.filter(i => i !== ""),
				options: {
					cwd: cwd,
					env: process.env,
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
				},
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
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	init(cwd, verbose = false) {
		const verboseArgs = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["init", verboseArgs]);
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
	async countCommits(cwd) {
		try {
			const result = await this.cmd(cwd, ["rev-list", "--count", "HEAD", ]);
			if (isNaN(+result)) {
				throw result;
			}
			return +result;
		} catch (err) {
			// check for 0 commits
			try {
				await this.cmd(cwd, ["log", "-1", "--format=%B", ]);
				throw err;
			} catch (logErr) {
				if (logErr.endsWith("does not have any commits yet")) {
					return 0;
				}
				throw err;
			}
		}
	},

	/**
	 * Add files to track
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to add
	 * @param {bool} [verbose=false] Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	add(cwd, files, verbose = false) {
		const verboseArg = (verbose ? "--verbose" : "");
		return this.cmd(cwd, ["add", verboseArg, "--", ...files]);
	},

	/**
	 * Get the root directory of the git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string} The absolute path of the root directory
	 */
	async rootDir(cwd) {
		const result = await this.cmd(cwd, ["rev-parse", "--show-toplevel"]);
		return result.trimRight()
			.replace("/", path.sep);
	},

	/**
	 * Commit files with message or amend last commit with message
	 * @param {string} cwd Current Working Directory
	 * @param {string} message The commit message.
	 * @param {bool} amend True = amend last commit, False = create new commit
	 * @param {string[]} files The files to commit
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	commit(cwd, message, amend, files, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		const amendArg = (amend ? "--amend" : "");
		return this.cmd(cwd, ["commit", verboseArg, "--file=-", amendArg, "--", ...files], message);
	},

	/**
	 * Checkout branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to checkout
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutBranch(cwd, branch, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, branch]);
	},

	/**
	 * Create branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to create
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	createBranch(cwd, branch, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, "-b", branch]);
	},

	/**
	 * Set upstream branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} remote The remote to create the branch
	 * @param {string} branch The branch name
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	setUpstream(cwd, remote, branch, verbose = false) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["push", verboseArg, "--set-upstream", remote, branch]);
	},

	/**
	 * Checkout files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to checkout
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutFiles(cwd, files, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, "--", ...files]);
	},

	/**
	 * Remove untracked files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to remove
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	clean(cwd, files, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["clean", verboseArg, "--force", "--", ...files]);
	},

	/**
	 * Push commits to remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [force=false] Add --force flag
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	push(cwd, force = false, verbose = false) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		const forceArg = (force ? "--force" : "");
		return this.cmd(cwd, ["push", verboseArg, forceArg]);
	},

	/**
	 * Pull commits from remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [force=false] Add --force flag
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	pull(cwd, force = false, verbose = false) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		const forceArg = (force ? "--force" : "");
		return this.cmd(cwd, ["pull", verboseArg, forceArg]);
	},

	/**
	 * Unstage files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to reset
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	unstage(cwd, files, verbose = false) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["reset", "HEAD", verboseArg, "--", ...files]);
	},

	/**
	 * Undo last commit
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [hard=false] Discard changes
	 * @param {int} [nCommits=1] Number of commits to undo. Default = 1
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	async reset(cwd, hard = false, nCommits = 1, verbose = false) {
		nCommits = parseInt(nCommits, 10);
		if (isNaN(nCommits) || nCommits <= 0) {
			throw "nCommits is not a number greater than 0";
		}
		const hardArg = (hard ? "--hard" : "--mixed");
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["reset", hardArg, verboseArg, "HEAD~" + nCommits]);
	},

	/**
	 * Get last commit message
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string|null} The last commit message or null if no commits
	 */
	async lastCommit(cwd) {
		try {
			// if this.cmd is not await'd an error will never be caught
			return await this.cmd(cwd, ["log", "-1", "--format=%B"]);
		} catch (error) {
			if (error.endsWith("does not have any commits yet")) {
				return null;
			}
			throw error;
		}
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
	async status(cwd, filePaths) {
		const result = await this.cmd(cwd, ["status", "--porcelain", "--untracked-files=all", ...filePaths]);
		if (result === "") {
			return [];
		}

		return result.trimRight()
			.split("\n")
			.map(line => {
				const lineMatch = line.match(/^([ MADRCU?]{2}) "?(.*?)"?$/);
				if (!lineMatch) {
					throw "git status output invalid: '" + line.replace(" ", "·") + "'";
				}
				const [, code, file] = lineMatch;
				const status = this.statusFromCode(code);
				if (status === false) {
					throw "Unknown code '" + line.replace(" ", "·") + "'";
				}
				return { ...status, file };
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
			case "UU":
				added = true;
				changed = true;
				break;
			case " M":
				changed = true;
				break;
			case "D ":
			case "DD":
			case "DM":
			case "UD":
			case "DU":
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
			case "AA":
			case "AU":
			case "UA":
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
	async branches(cwd) {
		const result = await this.cmd(cwd, ["branch", "--list", "--all"]);
		if (result === "") {
			return [];
		}

		let branchNames = [];

		return result.split("\n")
			.map(line => {
				const path = line.trim();
				const selected = path.substring(0, 1) === "*";
				const name = path.replace(/^(\* )?(remotes\/origin\/)?/, "");
				if (branchNames.includes(name)) {
					return false;
				}
				branchNames.push(name);
				return { path, name, selected };
			})
			.filter(el => el);
	},

	/**
	 * Fetch from remotes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	fetch(cwd, verbose = false) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["fetch", "--all", "--prune", verboseArg]);
	},

	/**
	 * Stash or unstash changes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [pop=false] Restore the last changes that were stashed
	 * @param {bool} [verbose=false] Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	stash(cwd, pop = false, verbose = false) {
		const popArg = (pop ? "pop" : "");
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["stash", popArg, verboseArg]);
	},

	/**
	 * Update index and ignore/unignore changes from these files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files update
	 * @param {bool} [ignore=true] To ignore or unignore
	 * @param {bool} [verbose=false] Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	updateIndex(cwd, files, ignore = true, verbose = false) {
		const assumeUnchangedArg = (ignore ? "--assume-unchanged" : "--no-assume-unchanged");
		const verboseArg = (verbose ? "--verbose" : "");
		return this.cmd(cwd, ["update-index", assumeUnchangedArg, "--stdin", verboseArg], files.join("\n"));
	},
};
