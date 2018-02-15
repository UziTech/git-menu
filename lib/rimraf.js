/** @babel */

import path from "path";
import fs from "fs";
import promisificator from "promisificator";

/**
 * Remove directory or file synchronously
 * @param  {string} dir The directory or file to delete recursively
 * @return {void}
 */
export function rimrafSync(dir) {
	/* eslint-disable no-sync */
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach(file => {
			const curPath = path.join(dir, file);
			if (fs.lstatSync(curPath).isDirectory()) {
				rimrafSync(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(dir);
	}
	/* eslint-enable no-sync */
};

/**
 * Remove directory or file asynchronously
 * @param  {string} dir The directory or file to delete recursively
 * @param  {Function} cb A callback can be used instead of returning a promise
 * @return {Promise|void} A Promise will be returned if no callback is specified
 */
export default function rimraf(dir, cb) {
	const {
		promise,
		callback,
	} = promisificator(cb);

	fs.lstat(dir, (err, stats) => {
		if (err) {
			if (err.code === "ENOENT") {
				return callback();
			}
			return callback(err);
		}
		if (stats.isDirectory()) {
			fs.readdir(dir, (err2, files) => {
				if (err2) {
					return callback(err2);
				}
				Promise.all(files.map(file => rimraf(path.join(dir, file)))).then(() => {
					fs.rmdir(dir, callback);
				}, callback);
			});
		} else {
			fs.unlink(dir, callback);
		}
	});

	return promise;
};
