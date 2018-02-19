/** @babel */

import CommitDialog from "../../lib/dialogs/CommitDialog";
import {fileStatus, files} from "../mocks";

describe("CommitDialog", function () {

	describe("selected files", function () {

		beforeEach(function () {
			this.files = [fileStatus("M ", files.t1)];
		});

		it("initial state includes files", function () {
			const dialog = new CommitDialog({files: this.files});
			expect(dialog.state.files.length).toBe(this.files.length);
		});

		it("should select all files by default", function () {
			const dialog = new CommitDialog({files: this.files});
			const selectedFiles = dialog.state.files.filter(f => f.selected);
			expect(selectedFiles.length).toBe(this.files.length);
		});

		it("should not select files if filesSelectable is false", function () {
			const dialog = new CommitDialog({files: this.files, filesSelectable: false});
			const selectedFiles = dialog.state.files.filter(f => f.selected);
			expect(selectedFiles.length).toBe(0);
		});

	});

	describe("amend", function () {

		beforeEach(function () {
			this.message = "commit message";
			this.lastCommit = "last commit message";
			this.dialog = new CommitDialog({lastCommit: this.lastCommit});
		});

		it("should set the message as the last commit message if blank", async function () {
			this.dialog.amendChange({target: {checked: true}});

			expect(this.dialog.state.message).toBe(this.lastCommit);
		});

		it("should not change if message is not blank", async function () {
			this.dialog.state.message = this.message;
			this.dialog.amendChange({target: {checked: true}});

			expect(this.dialog.state.message).toBe(this.message);
		});

		it("should set the message empty if message is last commit", async function () {
			this.dialog.state.message = this.lastCommit;
			this.dialog.amendChange({target: {checked: false}});

			expect(this.dialog.state.message).toBe("");
		});

		it("should not change if message is not last commit", async function () {
			this.dialog.state.message = this.message;
			this.dialog.amendChange({target: {checked: false}});

			expect(this.dialog.state.message).toBe(this.message);
		});

	});

	describe("accept", function () {

		beforeEach(function () {
			this.message = "commit message";
			this.dialog = new CommitDialog();
			this.promise = this.dialog.activate();
			this.dialog.state.message = this.message;
		});

		it("should return the commit message", async function () {
			this.dialog.accept();
			const ret = await this.promise;
			expect(ret).toEqual([this.message, false, false, false, []]);
		});

		it("should return amend when checked", async function () {
			this.dialog.amendChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.promise;
			expect(ret).toEqual([this.message, true, false, false, []]);
		});

		it("should return push when push is clicked", async function () {
			this.dialog.pushClick();
			const ret = await this.promise;
			expect(ret).toEqual([this.message, false, true, false, []]);
		});

		it("should return push and sync when sync is clicked", async function () {
			this.dialog.syncClick();
			const ret = await this.promise;
			expect(ret).toEqual([this.message, false, true, true, []]);
		});

	});
});
