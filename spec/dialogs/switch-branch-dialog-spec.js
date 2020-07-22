/** @babel */

import SwitchBranchDialog from "../../lib/dialogs/SwitchBranchDialog";
import {mockGit} from "../mocks";

describe("SwitchBranchDialog", function () {

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
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root});
			expect(dialog.state.branch).toBe("selected");
		});

	});

	describe("fetch", function () {

		it("should set state.fetching to true", async function () {
			const git = mockGit({
				branches: () => this.branches
			});
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root, git});
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

			const dialog = new SwitchBranchDialog({branches, root: this.root, git});

			await dialog.fetch();
			expect(dialog.state.branches).toBe(this.branches);
		});

		it("should show error", async function () {
			const git = mockGit({
				fetch: () => Promise.reject("fetch error"),
				branches: () => this.branches
			});

			const notifications = jasmine.createSpyObj(["addError"]);

			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root, git, notifications});

			await dialog.fetch();
			expect(notifications.addError).toHaveBeenCalledWith("Fetch", "fetch error");
		});

	});

	describe("accept", function () {

		it("should return the selected branch name", async function () {
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root});
			const activate = dialog.activate();
			dialog.accept();
			const ret = await activate;
			expect(ret).toEqual(["selected", "origin"]);
		});

		it("should return the branch name", async function () {
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root});
			const activate = dialog.activate();
			dialog.branchChange({target: {value: "test"}});
			dialog.accept();
			const ret = await activate;
			expect(ret).toEqual(["test", null]);
		});

		it("should return the remote name", async function () {
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root});
			const activate = dialog.activate();
			dialog.branchChange({target: {value: "remotes/upstream/test"}});
			dialog.accept();
			const ret = await activate;
			expect(ret).toEqual(["test", "upstream"]);
		});

		it("should return the remote origin", async function () {
			const dialog = new SwitchBranchDialog({branches: this.branches, root: this.root});
			const activate = dialog.activate();
			dialog.branchChange({target: {value: "remote"}});
			dialog.accept();
			const ret = await activate;
			expect(ret).toEqual(["remote", "origin"]);
		});

	});
});
