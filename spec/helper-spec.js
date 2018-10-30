/** @babel */

import {Directory} from "atom";
import gitCmd from "../lib/git-cmd";
import helper from "../lib/helper";
import {getFilePath, mockGit, removeGitRoot, createGitRoot, fileStatus, files} from "./mocks";
import path from "path";

describe("helper", function () {

	beforeEach(async function () {
		await atom.packages.activatePackage("git-menu");
		this.gitRoot = await createGitRoot();

		this.repo = await atom.project.repositoryForDirectory(new Directory(this.gitRoot));

		this.statuses = [fileStatus("M ", files.t1), fileStatus("??", files.tt2)];
		this.git = mockGit({
			rootDir: Promise.resolve(this.gitRoot),
			status: Promise.resolve(this.statuses),
		});
	});

	afterEach(async function () {
		await removeGitRoot(this.gitRoot);
	});

	describe("getDirectories", function () {

		it("should get directory of file", async function () {
			const file = getFilePath(this.gitRoot, files.t1);
			const dir = this.gitRoot.replace(/[\/\\]$/, "");

			const dirs = await helper.getDirectories([file]);

			expect(dirs[0].cwd).toBe(dir);
			expect(dirs[0].isDir).toBe(false);
			expect(dirs[0].filePath).toBe(file);
		});

		it("should get directory of a directory", async function () {
			const dirs = await helper.getDirectories([this.gitRoot]);

			expect(dirs[0].cwd).toBe(this.gitRoot);
			expect(dirs[0].isDir).toBe(true);
			expect(dirs[0].filePath).toBe(this.gitRoot);
		});

	});

	describe("consolidateFiles", function () {

		it("should remove file if folder also selected", async function () {
			const dirs = await helper.getDirectories([getFilePath(this.gitRoot, files.t1), this.gitRoot]);
			const consolidatedFiles = helper.consolidateFiles(dirs);

			expect(consolidatedFiles).toEqual({
				[this.gitRoot]: [this.gitRoot]
			});
		});

		it("should group files in same folder", async function () {
			const dir = this.gitRoot.replace(/[\/\\]$/, "");
			const filePaths = getFilePath(this.gitRoot, [files.t1, files.t2]);

			const dirs = await helper.getDirectories(filePaths);
			const consolidatedFiles = helper.consolidateFiles(dirs);

			expect(consolidatedFiles).toEqual({
				[dir]: filePaths
			});
		});

		it("should not group files in different folder", async function () {
			const dir = this.gitRoot.replace(/[\/\\]$/, "");
			const testDir = path.join(this.gitRoot, "test");
			const filePaths = getFilePath(this.gitRoot, [files.t1, files.tt2]);

			const dirs = await helper.getDirectories(filePaths);
			const consolidatedFiles = helper.consolidateFiles(dirs);

			expect(consolidatedFiles).toEqual({
				[dir]: getFilePath(this.gitRoot, [files.t1]),
				[testDir]: getFilePath(this.gitRoot, [files.tt2]),
			});
		});

	});

	describe("getFilesInDir", function () {

		beforeEach(async function () {
			await gitCmd.remove(this.gitRoot);
		});

		it("should get files from folder", async function () {
			const filesInDir = await helper.getFilesInDir(path.join(this.gitRoot, "test"));

			expect(filesInDir).toEqual(getFilePath(this.gitRoot, [files.tt1, files.tt2]));
		});

		it("should get files from sub-folder", async function () {
			const filesInDir = await helper.getFilesInDir(this.gitRoot);

			expect(filesInDir).toEqual(getFilePath(this.gitRoot, [files.tt1, files.tt2, files.t1, files.t2]));
		});

	});

	describe("reduceFilesToCommonFolders", function () {

		beforeEach(function () {
			this.allFiles = [
				"/a.txt",
				"/b.txt",
				"/c/d/a.txt",
				"/c/d/b.txt",
				"/c/e/a.txt",
				"/c/e/b.txt",
			];
		});

		it("should not reduce files if there is not a common folder", async function () {
			const selectedFiles = [
				"/a.txt",
				"/c/d/a.txt",
				"/c/e/a.txt",
			];
			const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, this.allFiles);

			expect(reducedFiles).toEqual(selectedFiles);
		});

		it("should reduce files if there is a common folder", async function () {
			const selectedFiles = [
				"/a.txt",
				"/c/d/a.txt",
				"/c/d/b.txt",
				"/c/e/a.txt",
			];
			const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, this.allFiles);

			expect(reducedFiles).toEqual([
				"/a.txt",
				"/c/e/a.txt",
				"/c/d/",
			]);
		});

		it("should reduce sub-folders if there is a common folder", async function () {
			const selectedFiles = [
				"/a.txt",
				"/c/d/a.txt",
				"/c/d/b.txt",
				"/c/e/a.txt",
				"/c/e/b.txt",
			];
			const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, this.allFiles);

			expect(reducedFiles).toEqual([
				"/a.txt",
				"/c/",
			]);
		});

		it("should reduce to ['/'] if all files are selected", async function () {
			const reducedFiles = helper.reduceFilesToCommonFolders(this.allFiles, this.allFiles);

			expect(reducedFiles).toEqual(["/"]);
		});

		it("should remove files not in all files", async function () {
			const selectedFiles = [
				"/a.txt",
				"/b.txt",
				"/c.txt",
			];
			const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, this.allFiles);

			expect(reducedFiles).toEqual([
				"/a.txt",
				"/b.txt",
			]);
		});

	});

});
