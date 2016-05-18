"use babel";
/* globals atom */

import {
	CompositeDisposable
} from "atom";
import fs from "fs";
import path from "path";

export default {

	subscriptions: null,

	activate(state) {

		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"context-git:commit": (event) => {
				this.commit(event);
			}
		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

	commit(event) {
		let filepath = this.getPath(event.target);
		if (!filepath) {
			console.error("no path found");
			return;
		}

		this.getFiles(filepath)
			.then((files) => {
				console.debug(files);
				// TODO: get changed files from list of files
				// TODO: show commit prompt with ammend last commit and changed files
				// TODO: commit files
			})
			.catch((err) => {
				console.error(err);
			});
	},

	getPath(target) {
		const treeView = target.closest(".tree-view");
		if (treeView) {
			const selected = treeView.querySelector(".selected .name");
			if (!selected) {
				console.error("no file/folder selected");
			} else {
				return selected.dataset.path;
			}
		} else if (target.getModel && target.getModel().getPath) {
			return target.getModel().getPath();
		}

		return null;
	},

	getFiles(filepath) {

		return new Promise((resolve) => {

			fs.stat(filepath, (err, stats) => {
				if (err) {
					throw err;
				}

				if (stats.isFile()) {
					resolve([filepath]);
				} else {
					fs.readdir(filepath, (err, files) => {
						Promise.all(files.map((file) => {
								return this.getFiles(path.resolve(filepath, file));
							}))
							.then((files) => {
								// files will  be an array of arrays.
								// we want to change it to a flat array.
								resolve([].concat.apply([], files));
							});
					});
				}
			});
		});
	}

};
