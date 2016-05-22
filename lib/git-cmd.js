"use babel";
/* globals atom */

import {
	BufferedProcess,
} from "atom";
import path from "path";

export default {

	/**
	 * Send git command with arguments
	 * @param  {string} cwd Current Working Directory
	 * @param  {string[]} args Argument list
	 * @return {Promise} Will resolve to the result of the command or throw if there is an error
	 */
	cmd(cwd, args) {
			return new Promise((resolve) => {
				let output = "";
				new BufferedProcess({
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
							throw output;
						}
					}
				});
			});
		},

		/**
		 * Add files to track
		 * @param {string} cwd Current Working Directory
		 * @param {string[]} files The files to add
		 * @return {Promise} Will throw on error
		 */
		add(cwd, files) {
			return this.cmd(cwd, ["add"].concat("--", files))
				.then((result) => {
					if (result !== "") {
						throw result.trimRight();
					}
				});
		},

		/**
		 * Get the root directory of the git repository
		 * @param {string} cwd Current Working Directory
		 * @return {Promise} Will resolve to the absolute path of the root directory or throw on error
		 */
		rootDir(cwd) {
			return this.cmd(cwd, ["rev-parse", "--show-toplevel"])
				.then((result) => {
					return result.trimRight().replace("/", path.sep);
				});
		},

		/**
		 * Commit files with message or amend last commit with message
		 * @param  {[type]} cwd [description]
		 * @param  {string} message The commit message.
		 * @param  {bool} amend True = amend last commit, False = create new commit
		 * @param  {string[]} files The files to commit
		 * @return {Promise} Will throw on error
		 */
		commit(cwd, message, amend, files) {
			let args = ["commit", "-q", (amend ? "--amend" : ""), "-m", message];
			return this.add(cwd, files)
				.then(() => {
					return this.cmd(cwd, args.concat("--", files));
				})
				.then((result) => {
					if (result !== "") {
						throw result.trimRight();
					}
				});
		},

		/**
		 * Unstage all files
		 * @param {[type]} cwd [description]
		 * @return {Promise} Will throw on error
		 */
		reset(cwd) {
			return this.cmd(cwd, ["reset", "HEAD", "-q"])
				.then((result) => {
					if (result !== "") {
						throw result.trimRight();
					}
				});
		},

		/**
		 * Get last commit message
		 * @param  {[type]} cwd [description]
		 * @return {Promise} Will resolve to the message or throw on error
		 */
		lastCommit(cwd) {
			return this.cmd(cwd, ["log", "-1", "--oneline"])
				.then((result) => {
					return result.trimRight().replace(/^\S+ /, "");
				});
		},

		/**
		 * Get the status on changed files
		 * @param  {[type]} cwd [description]
		 * @param  {string} filePaths The directorys or files to check
		 * @return {Promise} Will resolve to an object[] or throw on error
		 *                        [
		 *                          {
		 *                            added,
		 *                            untracked,
		 *                            deleted,
		 *                            changed,
		 *                            file,
		 *                          }, ...
		 *                        ]
		 */
		status(cwd, filePaths) {
			return this.cmd(cwd, ["status", "--porcelain", "-u", ...filePaths])
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
								added = true;
								changed = true;
								break;
							case " M":
								changed = true;
								break;
							case "D ":
								added = true;
								deleted = true;
								break;
							case " D":
								deleted = true;
								break;
							case "A ":
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
