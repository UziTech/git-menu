/** @babel */

import {BufferedProcess} from "atom";
import path from "path";
import rimraf from "rimraf";
import {promisify} from "promisificator";
import {isVerbose} from "./Notifications";

export default {

	/**
	 * Send git command with arguments
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} [args=[]] Argument list. Any empty strings will be removed.
	 * @param {string} [stdin=""] String to write to stdin
	 * @param {bool} [includeCommand=true] Include the command in output
	 * @return {Promise} {string} The result of the command
	 */
	cmd(cwd, args = [], stdin = "", includeCommand = true) {
		return new Promise((resolve, reject) => {
			let output = "";
			const git = atom.config.get("git-menu.gitPath");
			// eslint-disable-next-line no-param-reassign
			args = args.filter(i => i !== "");
			const bp = new BufferedProcess({
				command: git,
				args,
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
					if (isVerbose() && includeCommand) {
						if (process.platform === "win32") {
							output = `> ${bp.process.spawnargs[bp.process.spawnargs.length - 1].replace(/^"(.+)"$/g, "$1")}\n\n${output}`;
						} else {
							output = `> ${git} ${args.join(" ")}\n\n${output}`;
						}
					}

					if (code === 0) {
						resolve(output);
					} else {
						reject(`Error code: ${code}\n\n${output}`);
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
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	init(cwd, verbose = isVerbose()) {
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
		return promisify(rimraf)(gitPath, {disableGlob: true});
	},

	/**
	 * Count commits
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {int} The result of the command
	 */
	async countCommits(cwd) {
		try {
			const result = await this.cmd(cwd, ["rev-list", "--count", "HEAD"], "", false);
			if (isNaN(+result)) {
				throw result;
			}
			return +result;
		} catch (err) {
			// check for 0 commits
			const log = await this.log(cwd, 1);
			if (!log) {
				return 0;
			}
			throw err;
		}
	},

	/**
	 * Add files to track
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to add
	 * @param {bool} verbose Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	add(cwd, files, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "");
		return this.cmd(cwd, ["add", verboseArg, "--", ...files]);
	},

	/**
	 * Add files to track
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to diff
	 * @return {Promise} {string} The result of the command
	 */
	diff(cwd, files) {
		return this.cmd(cwd, ["diff", "--ignore-all-space", "--", ...files]);
	},

	/**
	 * Get the root directory of the git repository
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string} The absolute path of the root directory
	 */
	async rootDir(cwd) {
		const result = await this.cmd(cwd, ["rev-parse", "--show-toplevel"], "", false);
		return result.trimRight().replace("/", path.sep);
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
	commit(cwd, message, amend, files = null, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		const amendArg = (amend ? "--amend" : "");
		if (files) {
			files.unshift("--");
		} else {
			// eslint-disable-next-line no-param-reassign
			files = [];
		}
		return this.cmd(cwd, ["commit", verboseArg, "--file=-", amendArg, ...files], message);
	},

	/**
	 * Checkout branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to checkout
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutBranch(cwd, branch, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, branch]);
	},

	/**
	 * Create branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to create
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	createBranch(cwd, branch, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, "-b", branch]);
	},

	/**
	 * Delete a branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch name to create
	 * @param {bool} remote Delete a remote branch if it exists
	 * @param {bool} force Force delete the branch
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	deleteBranch(cwd, branch, remote = false, force = false, verbose = isVerbose()) {
		const forceArg = (force ? "--force" : "");
		const verboseArg = (!verbose ? "--quiet" : (remote ? "--verbose" : ""));
		let args;
		if (remote) {
			args = ["push", "--delete", forceArg, verboseArg, "origin", branch];
		} else {
			args = ["branch", "--delete", forceArg, verboseArg, branch];
		}
		return this.cmd(cwd, args);
	},

	/**
	 * Set upstream branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} remote The remote to create the branch
	 * @param {string} branch The branch name
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	setUpstream(cwd, remote, branch, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["push", verboseArg, "--set-upstream", remote, branch]);
	},

	/**
	 * Checkout files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to checkout
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	checkoutFiles(cwd, files, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["checkout", verboseArg, "--", ...files]);
	},

	/**
	 * Remove untracked files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to remove
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	clean(cwd, files, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		if (files.length === 1 && files[0] === ".") {
			// files === ["."] means all files
			// eslint-disable-next-line no-param-reassign
			files = [];
		} else {
			files.unshift("--");
		}
		return this.cmd(cwd, ["clean", verboseArg, "--force", "-d", ...files]);
	},

	/**
	 * Push commits to remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [force=false] Add --force flag
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	push(cwd, force = false, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		const forceArg = (force ? "--force" : "");
		return this.cmd(cwd, ["push", verboseArg, forceArg]);
	},

	/**
	 * Pull commits from remote repo
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [force=false] Add --force flag
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	pull(cwd, force = false, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		const forceArg = (force ? "--force" : "");
		return this.cmd(cwd, ["pull", verboseArg, forceArg]);
	},

	/**
	 * Merge commits from a branch into the current branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch to merge
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	merge(cwd, branch, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["merge", branch, verboseArg]);
	},

	/**
	 * Rebase commits from a branch into the current branch
	 * @param {string} cwd Current Working Directory
	 * @param {string} branch The branch to rebase on
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	rebase(cwd, branch, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["rebase", branch, verboseArg]);
	},

	/**
	 * Unstage files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files to reset
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	unstage(cwd, files = null, verbose = isVerbose()) {
		const verboseArg = (!verbose ? "--quiet" : "");
		if (files) {
			files.unshift("--");
		} else {
			// eslint-disable-next-line no-param-reassign
			files = [];
		}
		return this.cmd(cwd, ["reset", verboseArg, ...files]);
	},

	/**
	 * Undo last commit
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [hard=false] Discard changes
	 * @param {int} [nCommits=1] Number of commits to undo. Default = 1
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	reset(cwd, hard = false, nCommits = 1, verbose = isVerbose()) {
		// eslint-disable-next-line no-param-reassign
		nCommits = parseInt(nCommits, 10);
		if (isNaN(nCommits) || nCommits <= 0) {
			throw "nCommits is not a number greater than 0";
		}
		const hardArg = (hard ? "--hard" : "--mixed");
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["reset", hardArg, verboseArg, `HEAD~${nCommits}`]);
	},

	/**
	 * Get last commit message
	 * @param {string} cwd Current Working Directory
	 * @return {Promise} {string|null} The last commit message or null if no commits
	 */
	async lastCommit(cwd) {
		const result = await this.log(cwd, 1);
		if (!result) {
			return null;
		}
		return result;
	},

	/**
	 * Get Log
	 * @param {string} cwd Current Working Directory
	 * @param {int} [number=1] Number of commits
	 * @param {string} [offset=0] Offset
	 * @param {string} [format="%B"] Format
	 * @return {Promise} {string|null} The last commit message or null if no commits
	 */
	async log(cwd, number = 1, offset = 0, format = "%B") {
		try {
			return await this.cmd(cwd, ["log", `--max-count=${number}`, `--skip=${offset}`, `--format=${format}`], "", false);
		} catch (error) {
			if (error.endsWith("does not have any commits yet")) {
				return "";
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
		const result = await this.cmd(cwd, ["status", "--porcelain", "--untracked-files=all", ...filePaths], "", false);
		if (result === "") {
			return [];
		}

		return result.trimRight().split("\n").map(line => {
			const lineMatch = line.match(/^([ MADRCU?]{2}) "?(.*?)"?$/);
			if (!lineMatch) {
				throw `git status output invalid: '${line.replace(" ", "·")}'`;
			}
			const [, code, file] = lineMatch;
			const status = this.statusFromCode(code);
			if (status === false) {
				throw `Unknown code '${line.replace(" ", "·")}'`;
			}
			return {...status, file};
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
	 * @param {bool} [remotes=true] List remote branches
	 * @return {Promise} {object[]} Repository branch names
	 */
	async branches(cwd, remotes = true) {
		const remotesArg = (remotes ? "--all" : "");
		const result = await this.cmd(cwd, ["branch", "--list", remotesArg], "", false);
		if (result === "") {
			return [];
		}

		return Object.values(result.split("\n").reduce((branches, line) => {
			const branch = line.trim();

			if (branch.match(/\/HEAD\b/)) {
				return branches;
			}

			const selected = branch.startsWith("* ");
			const remote = branch.includes("remotes/origin/");
			const local = !remote;
			const name = branch.replace(/^(\* )?(remotes\/origin\/)?/, "");

			if (name in branches) {
				if (local) {
					branches[name].local = true;
					branches[name].branch = branch;
				} else {
					branches[name].remote = true;
				}
				if (selected) {
					branches[name].selected = true;
					branches[name].branch = branch;
				}
			} else {
				branches[name] = {branch, name, selected, local, remote};
			}
			return branches;
		}, {}));
	},

	/**
	 * Fetch from remotes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	fetch(cwd, verbose = isVerbose()) {
		const verboseArg = (verbose ? "--verbose" : "--quiet");
		return this.cmd(cwd, ["fetch", "--all", "--prune", verboseArg]);
	},

	/**
	 * Stash or unstash changes
	 * @param {string} cwd Current Working Directory
	 * @param {bool} [pop=false] Restore the last changes that were stashed
	 * @param {bool} verbose Not add the --quiet flag
	 * @return {Promise} {string} The result of the command
	 */
	stash(cwd, pop = false, verbose = isVerbose()) {
		const popArg = (pop ? "pop" : "");
		const verboseArg = (!verbose ? "--quiet" : "");
		return this.cmd(cwd, ["stash", popArg, verboseArg]);
	},

	/**
	 * Update index and ignore/unignore changes from these files
	 * @param {string} cwd Current Working Directory
	 * @param {string[]} files The files update
	 * @param {bool} [ignore=true] To ignore or unignore
	 * @param {bool} verbose Add the --verbose flag
	 * @return {Promise} {string} The result of the command
	 */
	updateIndex(cwd, files, ignore = true, verbose = isVerbose()) {
		const assumeUnchangedArg = (ignore ? "--assume-unchanged" : "--no-assume-unchanged");
		const verboseArg = (verbose ? "--verbose" : "");
		return this.cmd(cwd, ["update-index", assumeUnchangedArg, "--stdin", verboseArg], files.join("\n"));
	},
};
