/** @babel */

import MergeBranchDialog from "../../lib/dialogs/MergeBranchDialog";
import {mockGit} from "../mocks";

describe("MergeBranchDialog", function () {

	beforeEach(function () {
		this.branches = [
			{name: "local", branch: "first", local: true},
			{name: "selected", branch: "third", selected: true, local: true, remote: true},
		];

		this.root = "root";

		spyOn(atom, "confirm").and.callFake((opts, callback) => {
			callback([0, false]);
		});
	});

	describe("selected branch", function () {

		it("should select selected branch", function () {
			const dialog = new MergeBranchDialog({branches: this.branches, root: this.root});
			expect(dialog.state.rootBranch).toBe("selected");
		});

	});

	describe("fetch", function () {

		it("should set state.fetching to true", async function () {
			const git = mockGit({
				branches: () => this.branches
			});
			const dialog = new MergeBranchDialog({branches: this.branches, root: this.root, git});
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

			const dialog = new MergeBranchDialog({branches, root: this.root, git});

			await dialog.fetch();
			expect(dialog.state.branches).toBe(this.branches);
		});

		it("should show error", async function () {
			const git = mockGit({
				fetch: () => Promise.reject("fetch error"),
				branches: () => this.branches
			});

			const notifications = jasmine.createSpyObj(["addError"]);

			const dialog = new MergeBranchDialog({branches: this.branches, root: this.root, git, notifications});

			await dialog.fetch();
			expect(notifications.addError).toHaveBeenCalledWith("Fetch", "fetch error");
		});

	});

	describe("accept", function () {

		beforeEach(function () {
			this.dialog = new MergeBranchDialog({branches: this.branches, root: this.root});
			this.activate = this.dialog.activate();
		});

		it("should return the root branch object", async function () {
			this.dialog.rootBranchChange({target: {value: "local"}});
			this.dialog.mergeBranchChange({target: {value: "selected"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[0]).toBe(this.branches[0]);
		});

		it("should return the merge branch object", async function () {
			this.dialog.mergeBranchChange({target: {value: "local"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[1]).toBe(this.branches[0]);
		});

		it("should return rebase", async function () {
			this.dialog.mergeBranchChange({target: {value: "local"}});
			this.dialog.rebaseChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[2]).toBe(true);
		});

		it("should return delete", async function () {
			this.dialog.mergeBranchChange({target: {value: "local"}});
			this.dialog.deleteChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[3]).toBe(true);
		});

		it("should return abort", async function () {
			this.dialog.mergeBranchChange({target: {value: "local"}});
			this.dialog.abortChange({target: {checked: false}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[4]).toBe(false);
		});

		it("should show error on same branch", function () {
			this.dialog.rootBranchChange({target: {value: "selected"}});
			this.dialog.mergeBranchChange({target: {value: "selected"}});
			expect(this.dialog.refs.rootBranchInput.classList).not.toContain("error");
			expect(this.dialog.refs.mergeBranchInput.classList).not.toContain("error");
			this.dialog.accept();
			expect(this.dialog.refs.rootBranchInput.classList).toContain("error");
			expect(this.dialog.refs.mergeBranchInput.classList).toContain("error");
		});

		describe("confirm", function () {

			it("should confirm on delete", async function () {
				this.dialog.state.delete = true;
				this.dialog.state.rootBranch = "branch1";
				this.dialog.state.mergeBranch = "branch2";
				this.dialog.accept();
				await this.activate;
				expect(atom.confirm).toHaveBeenCalled();
			});

			it("should not confirm on not delete", async function () {
				this.dialog.state.delete = false;
				this.dialog.state.rootBranch = "branch1";
				this.dialog.state.mergeBranch = "branch2";
				this.dialog.accept();
				await this.activate;
				expect(atom.confirm).not.toHaveBeenCalled();
			});

		});
	});
});
