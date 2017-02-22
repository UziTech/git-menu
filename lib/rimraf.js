"use babel";

import path from "path";
import fs from "fs";

// from https://github.com/UziTech/promisificator
function promisificator(cb) {
	let promise, callback;
	switch (typeof cb) {
		case "undefined":
			promise = new Promise((resolve, reject) => {
				callback = function (err, value) {
					if (err) {
						reject(err);
					} else if (arguments.length <= 2) {
						resolve(value);
					} else {
						let values = Array.from(arguments).slice(1);
						resolve(values);
					}
				};
			});
			break;
		case "function":
			callback = function () {
				process.nextTick(cb, ...arguments);
			};
			break;
		default:
			throw new Error("First argument must be a function or undefined.");
	}
	return {
		promise,
		callback,
	};
};

/**
 * Remove directory or file synchronously
 * @param  {string} dir The directory or file to delete recursively
 * @return {void}
 */
export function rimrafSync(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach((file, index) => {
			const curPath = path.join(dir, file);
			if (fs.lstatSync(curPath).isDirectory()) {
				rimrafSync(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(dir);
	}
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
			if (err.code === "ENOENT") return callback();
			return callback(err);
		}
		if (stats.isDirectory()) {
			fs.readdir(dir, (err, files) => {
				if (err) return callback(err);
				Promise.all(files.map(file => rimraf(path.join(dir, file)))).then(_ => {
					fs.rmdir(dir, callback);
				}, callback);
			});
		} else {
			fs.unlink(dir, callback);
		}
	});

	return promise;
};
