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
			}
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
			const checkboxes = component.element.querySelectorAll("[type='checkbox']");

			this.checkbox = (name) => {
				const order = [
					"a/b/",
					"a/b/f.js",
					"a/b/g.js",
					"b/a/f.js",
					"c/a/",
					"c/a/b/f.js",
					"c/a/c/f.js",
				];
				const index = order.indexOf(name);

				return index > -1 ? checkboxes[index] : null;
			};
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

});
