"use babel";
/* globals atom */

import { Directory } from "atom";
import fs from "fs";
import path from "path";

export default {

	/**
	 * Remove selected files where a parent folder is also selected and group by parent folder.
	 * @param  {Object[]} cwdDirs The result of getDirectories()
	 * @return {Object} Keys will be cwds and values will be an array of files for that cwd
	 */
	consolidateFiles(cwdDirs) {
		let dirs = cwdDirs.filter(cwdFile => cwdFile.isDir).map(cwdFile => cwdFile.filePath);
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
			return [tab.querySelector(".title").dataset.path];
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
	getDirectories(filePaths) {
		return Promise.all(filePaths.map(filePath => {
			return new Promise((resolve, reject) => {
				fs.stat(filePath, (err, stats) => {
					if (err) {
						return reject(err);
					}

					let cwd;
					const isDir = stats.isDirectory();

					if (isDir) {
						cwd = filePath;
					} else {
						cwd = path.dirname(filePath);
					}

					resolve({
						cwd,
						isDir,
						filePath
					});
				});
			});
		}));
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
	refreshAtom(root) {
		if (typeof root === "undefined") {
			root = atom.project.getDirectories().map(dir => dir.getPath());
		}
		if (!Array.isArray(root)) {
			root = [root];
		}
		return Promise.all(root.map(dir => {
			atom.project.repositoryForDirectory(new Directory(dir)).then(repo => {
				repo.refreshStatus();
			});
		}));
	},

	/**
	 * Get files inside directory
	 * @param  {string} dir The file paths to look for files
	 * @return {Promise} {string[]} The list of files in directory
	 */
	getFilesInDir(dir) {
		return new Promise((resolve, reject) => {
			fs.stat(dir, (err, stats) => {
				if (err) {
					return reject(err);
				}

				if (stats.isDirectory()) {
					fs.readdir(dir, (err, filePaths) => {
						if (err) {
							return reject(err);
						}

						Promise.all(filePaths.map(filePath => this.getFilesInDir(path.resolve(dir, filePath)))).then(files => {
							resolve(files.reduce((prev, file) => prev.concat(file), []));
						}, reject);
					});
				} else {
					resolve([dir]);
				}
			});
		});
	},

	/**
	 * Get file statuses
	 * @param  {string[]} filePaths A list of file/folder paths
	 * @param  {Object} git git-cmd
	 * @return {Promise} {Object[]} The file statuses
	 */
	getStatuses(filePaths, git) {
		return this.getDirectories(filePaths)
			.then(cwdDirs => {
				// remove duplicates
				const cwdFiles = this.consolidateFiles(cwdDirs);
				const cwds = Object.keys(cwdFiles);

				return Promise.all(cwds.map(cwd => git.status(cwd, cwdFiles[cwd])));
			})
			.then((statuses) => {
				// flatten statuses
				return statuses.reduce((prev, status) => prev.concat(status), []);
			});
	},

	/**
	 * Get the git root directory
	 * @param  {string[]} filePaths A list of file/folder paths
	 * @param  {Object} git git-cmd
	 * @return {Promise} {string} The root directory
	 */
	getRoot(filePaths, git) {
		return this.getDirectories(filePaths)
			.then(cwdDirs => {

				// remove duplicates
				const cwdFiles = this.consolidateFiles(cwdDirs);

				return Promise.all(Object.keys(cwdFiles).map(cwd => git.rootDir(cwd)));
			})
			.then(rootDirs => {
				// remove duplicates
				const roots = [...new Set(rootDirs)];
				if (roots.length > 1) {
					throw "Selected files are not in the same repository";
					// TODO: should we be able to handle this instead of throwing an error?
				}
				return roots[0];
			});
	},

	/**
	 * Get all files associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[string[], string]} Resolves to [files, root]
	 */
	getRootAndAllFiles(filePaths, git) {

		const getFiles = Promise.all(filePaths.map(filePath => this.getFilesInDir(filePath)))
			.then(files => {
				const allFiles = files.reduce((prev, file) => prev.concat(file), []);
				return [...new Set(allFiles)];
			});

		return Promise.all([getFiles, this.getRoot(filePaths, git)]);
	},

	/**
	 * Get files git statuses associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[Object[], string]} Resolves to [files, root]
	 */
	getRootAndFilesStatuses(filePaths, git) {

		if (this.getUnsavedFiles(filePaths).length > 0) {
			return Promise.reject("Save files before running git.");
		}

		return Promise.all([this.getStatuses(filePaths, git), this.getRoot(filePaths, git)]);
	},

	/**
	 * Get files associated with context files
	 * @param  {string[]} filePaths The context files
	 * @param  {Object} git git-cmd
	 * @return {Promise} {[Object[], string]} Resolves to [files, root]
	 */
	getRootAndFiles(filePaths, git) {
		return this.getRootAndFilesStatuses(filePaths, git).then(([statuses, root]) => {
			const files = statuses.map(file => file.file);
			return [files, root];
		});
	}
};
