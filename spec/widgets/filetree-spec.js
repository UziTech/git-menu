/** @babel */

import etch from "etch";
import FileTree from "../../lib/widgets/FileTree.js";

describe("FileTree.js", function () {
	beforeEach(function () {
		etch.setScheduler({
			updateDocument(callback) {
				callback();
			},
			getNextUpdatePromise() {
				return Promise.resolve();
			},
		});

		this.files = [
			{file: "a/b/f.js"},
			{file: "a/b/g.js"},
			{file: "b/a/f.js"},
			{file: "c/a/b/f.js"},
			{file: "c/a/c/f.js"},
		];
	});

	it("should group files by folder", function () {
		const component = new FileTree({files: this.files});
		jasmine.attachToDOM(component.element);
		const spans = component.element.querySelectorAll(".input-label");
		const labels = [];
		for (const span of spans) {
			labels.push(span.textContent.trim());
		}

		expect(labels).toEqual([
			"a/b/",
			"f.js",
			"g.js",
			"b/a/f.js",
			"c/a/",
			"b/f.js",
			"c/f.js",
		]);
	});

	it("should sort folders first", function () {
		const component = new FileTree({files: [
			{file: "a/a.js"},
			{file: "a/b.js"},
			{file: "a/c/d.js"},
			{file: "a/c/e.js"},
		]});
		jasmine.attachToDOM(component.element);
		const spans = component.element.querySelectorAll(".input-label");
		const labels = [];
		for (const span of spans) {
			labels.push(span.textContent.trim());
		}

		expect(labels).toEqual([
			"a/",
			"c/",
			"d.js",
			"e.js",
			"a.js",
			"b.js",
		]);
	});

	it("should sort folders with single file first", function () {
		const component = new FileTree({files: [
			{file: "a/a.js"},
			{file: "a/b.js"},
			{file: "a/c/a.js"},
		]});
		jasmine.attachToDOM(component.element);
		const spans = component.element.querySelectorAll(".input-label");
		const labels = [];
		for (const span of spans) {
			labels.push(span.textContent.trim());
		}

		expect(labels).toEqual([
			"a/",
			"c/a.js",
			"a.js",
			"b.js",
		]);
	});

	it("should select all files initially", function () {
		const component = new FileTree({files: this.files});
		jasmine.attachToDOM(component.element);
		const selectedFiles = component.getSelectedFiles();
		const files = this.files.map(f => f.file);

		for (const file of files) {
			expect(selectedFiles).toContain(file);
		}
	});

	it("should select all files when not showing checkboxes", function () {
		const component = new FileTree({files: this.files, showCheckboxes: false});
		jasmine.attachToDOM(component.element);
		const selectedFiles = component.getSelectedFiles();
		const files = this.files.map(f => f.file);

		for (const file of files) {
			expect(selectedFiles).toContain(file);
		}
	});

	it("should show checkboxes", function () {
		const component = new FileTree({files: this.files});
		jasmine.attachToDOM(component.element);

		const checkboxes = component.element.querySelector("[type='checkbox']");

		expect(checkboxes).not.toBe(null);
	});

	it("should not show checkboxes", function () {
		const component = new FileTree({files: this.files, showCheckboxes: false});
		jasmine.attachToDOM(component.element);

		const checkboxes = component.element.querySelector("[type='checkbox']");

		expect(checkboxes).toBe(null);
	});

	it("should show folders", function () {
		const component = new FileTree({files: this.files});
		jasmine.attachToDOM(component.element);

		const dirs = component.element.querySelector(".dir");

		expect(dirs).not.toBe(null);
	});

	it("should show files seperately when treeView is false", function () {
		const component = new FileTree({files: this.files, treeView: false});
		jasmine.attachToDOM(component.element);

		const dirs = component.element.querySelector(".dir");

		expect(dirs).toBe(null);
	});

	describe("checkboxes", () => {
		beforeEach(function () {
			const component = new FileTree({files: this.files});
			jasmine.attachToDOM(component.element);

			const checkboxes = [...component.element.querySelectorAll("[type='checkbox']")];
			this.checkbox = (name) => checkboxes.find(i => i.closest("li").key === name);
		});

		it("should (un)check all children", function () {
			expect(this.checkbox("a/b/f.js").checked).toBe(true);
			expect(this.checkbox("a/b/g.js").checked).toBe(true);

			this.checkbox("a/b/").click();

			expect(this.checkbox("a/b/f.js").checked).toBe(false);
			expect(this.checkbox("a/b/g.js").checked).toBe(false);

			this.checkbox("a/b/").click();

			expect(this.checkbox("a/b/f.js").checked).toBe(true);
			expect(this.checkbox("a/b/g.js").checked).toBe(true);
		});

		it("should change parents indeterminate", function () {
			expect(this.checkbox("a/b/").checked).toBe(true);
			expect(this.checkbox("a/b/").indeterminate).toBe(false);

			this.checkbox("a/b/f.js").click();

			expect(this.checkbox("a/b/").checked).toBe(false);
			expect(this.checkbox("a/b/").indeterminate).toBe(true);

			this.checkbox("a/b/f.js").click();

			expect(this.checkbox("a/b/").checked).toBe(true);
			expect(this.checkbox("a/b/").indeterminate).toBe(false);
		});
	});

	describe("buttons", () => {
		describe("click", () => {
			beforeEach(function () {
				const component = new FileTree({files: this.files});
				jasmine.attachToDOM(component.element);

				const buttons = [...component.element.querySelectorAll(".buttons button")];
				this.button = (name) => buttons.find(b => b.textContent === name);

				const checkboxes = [...component.element.querySelectorAll("[type='checkbox']")];
				this.someChecked = () => checkboxes.some(c => c.checked);
				this.someUnchecked = () => checkboxes.some(c => !c.checked);

				this.someCollapsed = () => !!component.element.querySelector(".dir.collapsed");
				this.someExpanded = () => !!component.element.querySelector(".dir:not(.collapsed)");
			});

			it("should check/uncheck all", async function () {
				expect(this.someChecked()).toBe(true);

				this.button("Uncheck All").click();

				expect(this.someChecked()).toBe(false);
				expect(this.someUnchecked()).toBe(true);

				this.button("Check All").click();

				expect(this.someUnchecked()).toBe(false);
			});

			it("should collapse/expand all", async function () {
				expect(this.someExpanded()).toBe(true);

				this.button("Collapse All").click();

				expect(this.someExpanded()).toBe(false);
				expect(this.someCollapsed()).toBe(true);

				this.button("Expand All").click();

				expect(this.someCollapsed()).toBe(false);
			});
		});

		describe("show", () => {
			beforeEach(function () {
				this.fileTree = (options) => {
					const component = new FileTree(options);
					jasmine.attachToDOM(component.element);

					const buttons = [...component.element.querySelectorAll(".buttons button")];
					this.button = (name) => {
						return buttons.find(b => b.textContent === name);
					};
				};
			});

			it("should show all buttons", async function () {
				this.fileTree({files: this.files});

				expect(this.button("Uncheck All")).toBeVisible();
				expect(this.button("Check All")).toBeVisible();
				expect(this.button("Collapse All")).toBeVisible();
				expect(this.button("Expand All")).toBeVisible();
			});

			it("should hide check/uncheck all when checkboxes are not shown", async function () {
				this.fileTree({files: this.files, showCheckboxes: false});

				expect(this.button("Uncheck All")).not.toBeVisible();
				expect(this.button("Check All")).not.toBeVisible();
				expect(this.button("Collapse All")).toBeVisible();
				expect(this.button("Expand All")).toBeVisible();
			});

			it("should hide all when only one file", async function () {
				this.fileTree({files: [{file: "a/b.js"}]});

				expect(this.button("Uncheck All")).not.toBeVisible();
				expect(this.button("Check All")).not.toBeVisible();
				expect(this.button("Collapse All")).not.toBeVisible();
				expect(this.button("Expand All")).not.toBeVisible();
			});

			it("should hide collapse/expand all when treeView is false", async function () {
				this.fileTree({files: this.files, treeView: false});

				expect(this.button("Uncheck All")).toBeVisible();
				expect(this.button("Check All")).toBeVisible();
				expect(this.button("Collapse All")).not.toBeVisible();
				expect(this.button("Expand All")).not.toBeVisible();
			});

			it("should hide collapse/expand all when no folders", async function () {
				this.fileTree({files: [{file: "a/b.j"}, {file: "b/c.j"}]});

				expect(this.button("Uncheck All")).toBeVisible();
				expect(this.button("Check All")).toBeVisible();
				expect(this.button("Collapse All")).not.toBeVisible();
				expect(this.button("Expand All")).not.toBeVisible();
			});
		});
	});

});
