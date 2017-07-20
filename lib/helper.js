"use babel";
/* globals atom */

import { Directory } from "atom";
import fs from "fs";
import path from "path";
import { promisify } from "promisificator";

export default {

	/**
	 * Remove selected files where a parent folder is also selected and group by parent folder.
	 * @param  {Object[]} cwdDirs The result of getDirectories()
	 * @return {Object} Keys will be cwds and values will be an array of files for that cwd
	 */
	consolidateFiles(cwdDirs) {
		let dirs = cwdDirs.filter(cwdFile => cwdFile.isDir)
			.map(cwdFile => cwdFile.filePath);
		let files = {};
		cwdDirs.forEach(cwdFile => {
			const isInSelectedDir = dirs.some(dir => (cwdFile.filePath !== dir && cwdFile.filePath.startsWith(dir)));
			if (!isInSelectedDir) {
				if (!files.hasOwnProperty(cwdFile.cwd)) {
					files[cwdFile.cwd] = [];
				}
				files[cwdFile.cwd].push(cwdFile.filePath);
			}
		});
		return files;
	},

	/**
	 * Get the paths of the context target
	 * @param  {EventTarget} target The context target
	 * @return {string[]} The selected paths for the target
	 */
	getPaths(target) {
		if (!target) {
			return atom.project.getPaths();
		}

		const treeView = target.closest(".tree-view");
		if (treeView) {
			// called from treeview
			const selected = treeView.querySelectorAll(".selected > .list-item > .name, .selected > .name");
			if (selected.length > 0) {
				return [].map.call(selected, el => el.dataset.path);
			}
			return [];
		}

		const tab = target.closest(".tab-bar > .tab");
		if (tab) {
			// called from tab
			return [tab.querySelector(".title")
				.dataset.path];
		}

		const pane = target.closest("atom-pane");
		if (pane && pane.dataset.activeItemPath) {
			// called from active pane
			return [pane.dataset.activeItemPath];
		}

		return [];
	},

	/**
	 * Get cwds of filePaths
	 * @param  {string[]} filePaths The files to check
	 * @return {Promise} {Object[]} Will resolve to {cwd, isDir, filePath}
	 */
	async getDirectories(filePaths) {
		const directories = Promise.all(filePaths.map(async filePath => {
			const stats = await promisify(fs.stat)(filePath);

			let cwd;
			const isDir = stats.isDirectory();

			if (isDir) {
				cwd = filePath;
			} else {
				cwd = path.dirname(filePath);
			}

			return {
				cwd,
				isDir,
				filePath
			};
		}));

		return directories;
	},

	/**
	 * Get a list of unsaved files
	 * @param {string[]} filePaths The file paths to check for unsaved
	 * @return {string[]} Unsaved files;
	 */
	getUnsavedFiles(filePaths) {
		const unsavedTabs = document.querySelectorAll(".tab-bar > .tab.modified > .title");
		const unsavedFiles = [].map.call(unsavedTabs, el => el.dataset.path);
		return unsavedFiles.filter(file => (!!file && filePaths.some(filePath => file.startsWith(filePath))));
	},

	/**
	 * Refresh Atom git repositories
	 * @param {string|string[]} root Root directory(s) of the repo(s)
	 * @return {Promise} {void}
	 */
	async refreshAtom(root) {
		if (typeof root === "undefined") {
			root = atom.project.getDirectories()
				.map(dir => dir.getPath());
		}
		if (!Array.isArray(root)) {
			root = [root];
		}
		await Promise.all(root.map(async dir => {
			const repo = await atom.project.repositoryForDirectory(new Directory(dir));
			repo.refreshStatus();
		}));
	},

	/**
	 * Get files inside directory
	 * @param  {string} dir The file paths to look for files
	 * @return {Promise} {string[]} The list of files in directory
	 */
	async getFilesInDir(dir) {
		const stats = await promisify(fs.stat)(dir);

		if (stats.isDirectory()) {
			const filePaths = await promisify(fs.readdir)(dir);

			const files = await Promise.all(filePaths.map(filePath => this.getFilesInDir(path.resolve(dir, filePath))));
			return files.reduce((prev, file) => prev.concat(file), []);
		}

		return [dir];
	},

	/**
	 * Get file statuses
	 * @param  {string[]} filePaths A list of file/folder paths
	 * @param  {Object} git git-cmd
	 * @return {Promise} {Object[]} The file statuses
	 */
	async getStatuses(filePaths, git) {
		const cwdDirs = await this.getDirectories(filePaths);

		// remove duplicates
		const cwdFiles = this.consolidateFiles(cwdDirs);
		const cwds = Object.keys(cwdFiles);

		const statuses = await Promise.all(cwds.map(cwd => git.status(cwd, cwdFiles[cwd])));

		// flatten statuses
		return statuses.reduce((prev, status) => prev.concat(status), []);
	},

	/**
	 * Get the git root directory
	 * @param  {string[]} filePaths A list of file/folder paths
	 * @param  {Object} git git-cmd
	 * @return {Promise} {string} The root directory
	 */
	async getRoot(filePaths, git) {
		const cwdDirs = await this.getDirectories(filePaths);

		// remove duplicates
		const cwdFiles = this.consolidateFiles(cwdDirs);

		const rootDirs = await Promise.all(Object.keys(cwdFiles)
			.map(cwd => git.rootDir(cwd)));
		// remove duplicates
		const roots = [...new Set(rootDirs)];
		if (roots.length > 1) {
			throw "Selected files are not in the same repository";
			// TODO: should we be able to handle this instead of throwing an error?
		}
		return roots[0];
	},

	/**
	 * Get all files associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[string[], string]} Resolves to [files, root]
	 */
	async getRootAndAllFiles(filePaths, git) {

		const getFiles = await Promise.all(filePaths.map(filePath => this.getFilesInDir(filePath)));

		// flatten files
		const allFiles = files.reduce((prev, file) => prev.concat(file), []);
		const files = [...new Set(allFiles)];
		const root = await this.getRoot(filePaths, git);
		return [files, root];
	},

	/**
	 * Get files git statuses associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[Object[], string]} Resolves to [files, root]
	 */
	async getRootAndFilesStatuses(filePaths, git) {

		if (this.getUnsavedFiles(filePaths)
			.length > 0) {
			throw "Save files before running git.";
		}

		const [files, root] = await Promise.all([this.getStatuses(filePaths, git), this.getRoot(filePaths, git)]);

		return [files, root];
	},

	/**
	 * Get files associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[Object[], string]} Resolves to [files, root]
	 */
	async getRootAndFiles(filePaths, git) {
		const [statuses, root] = await this.getRootAndFilesStatuses(filePaths, git);
		const files = statuses.map(status => status.file);
		return [files, root];
	},

	/**
	 * Check if index.lock exists and ask the user to remove it
	 * @param  {string} root The root if the git repository
	 * @param  {integer} retry Check again after this much time (in ms) to see if the lock file still exists before showing the dialog. A falsey value means no retry.
	 * @return {Promise} {void}
	 */
	async checkGitLock(root, retry = 100) {
		const lockPath = path.resolve(root, ".git/index.lock");
		const fileExistsAsync = file => {
			return new Promise(resolve => {
				fs.access(file, err => {
					resolve(!err);
				});
			});
		};

		if (!await fileExistsAsync(lockPath)) {
			return;
		}

		if (retry) {
			const stillThere = await new Promise(resolve => {
				setTimeout(async _ => {
					if (await fileExistsAsync(lockPath)) {
						resolve(true);
					}
					resolve(false);
				}, retry);
			});

			if (!stillThere) {
				return;
			}
		}

		const removeLock = atom.confirm({
			message: "Another git process seems to be running in this repository, do you want to remove the lock file and continue?",
			detailedMessage: "You are deleting:\n" + lockPath,
			buttons: [
				"Remove Lock",
				"Continue Without Removing",
				"Cancel",
			]
		});

		if (removeLock === 2) {
			return Promise.reject();
		}

		if (removeLock === 0) {
			try {
				await promisify(fs.unlink)(lockPath);
			} catch (ex) {
				// if files no longer exists skip error
				if (!ex.code === "ENOENT") {
					throw ex;
				}
			}
		}
	},

	/**
	 * Reduce files to their folder if all files in that folder are selected
	 * @param  {string[]} selectedFiles The selected files to reduce
	 * @param  {string[]} allFiles All files to check for each folder
	 * @return {string[]} The list of files replaced by folders if all files are selected
	 */
	reduceFilesToCommonFolders(selectedFiles, allFiles) {
		if (selectedFiles.length === 0) {
			return [];
		}

		// filter out selected files not in all files
		let reducedFiles = selectedFiles.filter(file => allFiles.includes(file));
		if (reducedFiles.length === allFiles.length) {
			if (allFiles[0].startsWith("/")) {
				return ["/"];
			}
			return ["."];
		}

		// get folders to check
		const folders = reducedFiles.reduce((prev, file) => {
			let folder = path.dirname(file);
			while (![".", "/"].includes(folder) && !prev.includes(folder + "/")) {
				prev.push(folder + "/");
				folder = path.dirname(folder);
			}

			return prev;
		}, []);

		// check each folder
		let replaceFolders = folders.reduce((prev, folder) => {
			const allSelectedInFolder = allFiles.every(file => {
				if (file.indexOf(folder) !== 0) {
					return true;
				}
				return reducedFiles.includes(file);
			});

			if (allSelectedInFolder) {
				prev.push(folder);
			}

			return prev;
		}, []);

		// remove replaceFolders that are children of replaceFolders
		replaceFolders = replaceFolders.reduce((prev, folder) => {
			const isChildFolder = replaceFolders.some(otherFolder => {
				if (otherFolder === folder) {
					return false;
				}

				return folder.indexOf(otherFolder) === 0;
			});

			if (!isChildFolder) {
				prev.push(folder);
			}

			return prev;
		}, []);

		// remove files in replaceFolders
		reducedFiles = reducedFiles.reduce((prev, file) => {
			const shouldReplace = replaceFolders.some(folder => {
				if (file.indexOf(folder) === 0) {
					return true;
				}
			});
			if (!shouldReplace) {
				prev.push(file);
			}
			return prev;
		}, []);

		// add replaceFolders
		reducedFiles = reducedFiles.concat(replaceFolders);

		return reducedFiles;
	},
};
