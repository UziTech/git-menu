/** @babel */

import DeleteBranchDialog from "../../lib/dialogs/DeleteBranchDialog";
import {mockGit} from "../mocks";

describe("DeleteBranchDialog", function () {

	beforeEach(function () {
		this.branches = [
			{name: "local", branch: "first", local: true},
			{name: "remote", branch: "second", remote: true},
			{name: "selected", branch: "third", selected: true, local: true, remote: true},
		];

		this.root = "root";

		spyOn(atom, "confirm").and.callFake((opts, callback) => {
			callback([0, false]);
		});
	});

	describe("selected branch", function () {

		it("should select selected branch", function () {
			const dialog = new DeleteBranchDialog({branches: this.branches, root: this.root});
			expect(dialog.state.branch).toBe("selected");
		});

	});

	describe("fetch", function () {

		it("should set state.fetching to true", async function () {
			const git = mockGit({
				branches: () => this.branches
			});
			const dialog = new DeleteBranchDialog({branches: this.branches, root: this.root, git});
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

			const dialog = new DeleteBranchDialog({branches, root: this.root, git});

			await dialog.fetch();
			expect(dialog.state.branches).toBe(this.branches);
		});

		it("should show error", async function () {
			const git = mockGit({
				fetch: () => Promise.reject("fetch error"),
				branches: () => this.branches
			});

			const notifications = jasmine.createSpyObj(["addError"]);

			const dialog = new DeleteBranchDialog({branches: this.branches, root: this.root, git, notifications});

			await dialog.fetch();
			expect(notifications.addError).toHaveBeenCalledWith("Fetch", "fetch error");
		});

	});

	describe("accept", function () {

		beforeEach(function () {
			this.dialog = new DeleteBranchDialog({branches: this.branches, root: this.root});
			this.activate = this.dialog.activate();
		});

		it("should return the branch object", async function () {
			this.dialog.branchChange({target: {value: "local"}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[0]).toBe(this.branches[0]);
		});

		it("should return local", async function () {
			this.dialog.localChange({target: {checked: false}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[1]).toBe(false);
		});

		it("should return false if branch is not local", async function () {
			this.dialog.state.local = true;
			this.dialog.state.branch = "remote";
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[1]).toBe(false);
		});

		it("should return remote", async function () {
			this.dialog.remoteChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[2]).toBe(true);
			expect(atom.confirm).toHaveBeenCalled();
		});

		it("should return false if branch is not local", async function () {
			this.dialog.state.remote = true;
			this.dialog.state.branch = "local";
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[2]).toBe(false);
		});

		it("should return the force", async function () {
			this.dialog.forceChange({target: {checked: true}});
			this.dialog.accept();
			const ret = await this.activate;
			expect(ret[3]).toBe(true);
		});

	});
});
