/** @babel */

import CreateBranchDialog from "../../lib/dialogs/CreateBranchDialog";
import {mockGit} from "../mocks";

describe("CreateBranchDialog", function () {

	beforeEach(function () {
		this.branches = [
			{name: "local", branch: "first", local: true},
			{name: "remote", branch: "second", remote: true},
			{name: "selected", branch: "third", selected: true, local: true, remote: true},
		];

		this.root = "root";
	});

	describe("selected branch", function () {

		it("should select selected branch", function () {
			const dialog = new CreateBranchDialog({branches: this.branches, root: this.root});
			expect(dialog.state.sourceBranch).toBe("selected");
		});

	});

	describe("fetch", function () {

		it("should set state.fetching to true", async function () {
			const git = mockGit({
				branches: () => this.branches
			});
			const dialog = new CreateBranchDialog({branches: this.branches, root: this.root, git});
			spyOn(dialog, "update");
			await dialog.fetch();
			expect(dialog.update).toHaveBeenCalledWith({fetching: true});
		});

		it("should change branches", async function () {
			const git = mockGit({
				branches: () => this.branches
			});

			const branches = [
				{name: "name", branch: "branch", selected: true}
			];

			const dialog = new CreateBranchDialog({branches, root: this.root, git});

			await dialog.fetch();
			expect(dialog.state.branches).toBe(this.branches);
		});

		it("should show error", async function () {
			const git = mockGit({
				fetch: () => Promise.reject("fetch error"),
				branches: () => this.branches
			});

			const notifications = jasmine.createSpyObj(["addError"]);

			const dialog = new CreateBranchDialog({branches: this.branches, root: this.root, git, notifications});

			await dialog.fetch();
			expect(notifications.addError).toHaveBeenCalledWith("Fetch", "fetch error");
		});

	});

	describe("accept", function () {

		beforeEach(function () {
			this.dialog = new CreateBranchDialog({branches: this.branches, root: this.root});
			this.activate = this.dialog.activate();
		});

		it("should return the branch name", async function () {
			this.dialog.newBranchChange({target: {value: "test"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret).toEqual(["selected", "test", false]);
		});

		it("should remove illegal characters", async function () {
			this.dialog.newBranchChange({target: {value: "no space"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret).toEqual(["selected", "no-space", false]);
		});

		it("should return source branch", async function () {
			this.dialog.state.newBranch = "test";
			this.dialog.sourceBranchChange({target: {value: "source"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret).toEqual(["source", "test", false]);
		});

		it("should return track when checked", async function () {
			this.dialog.state.newBranch = "test";
			this.dialog.trackChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret).toEqual(["selected", "test", true]);
		});

	});
});
