"use babel";
/** @jsx etch.dom */

import Dialog from "../../lib/dialogs/Dialog";
import etch from "etch";

describe("Dialog", function () {
	beforeEach(function () {
		class TestDialog extends Dialog {
			title() {
				return "test-title";
			}
			body() {
				return (
					<div id="test-body"></div>
				);
			}
			buttons() {
				return (
					<div id="test-buttons"></div>
				);
			}
			validate(state) {
				return [];
			}
		}
		this.TestDialog = TestDialog;
	});

	it("should call this.initialState on constructor", function () {
		const props = {
			test: 1
		};
		spyOn(this.TestDialog.prototype, "initialState");
		new this.TestDialog(props);
		expect(this.TestDialog.prototype.initialState)
			.toHaveBeenCalledWith(props);
	});

	it("should call this.beforeInitialize on constructor", function () {
		spyOn(this.TestDialog.prototype, "beforeInitialize");
		new this.TestDialog();
		expect(this.TestDialog.prototype.beforeInitialize)
			.toHaveBeenCalled();
	});

	it("should return a promise on activate", function () {
		const promise = new this.TestDialog()
			.activate();
		expect(promise instanceof Promise)
			.toBeTruthy();
	});

	it("should add a model panel on activate", function () {
		let dialog;
		spyOn(atom.workspace, "addModalPanel");
		dialog = new this.TestDialog();
		dialog.activate();
		expect(atom.workspace.addModalPanel)
			.toHaveBeenCalledWith({ item: dialog });
	});

	it("should call this.show on activate", function () {
		spyOn(this.TestDialog.prototype, "show");
		new this.TestDialog()
			.activate();
		expect(this.TestDialog.prototype.show)
			.toHaveBeenCalled();
	});

	it("should cancel on [esc]", function () {
		spyOn(this.TestDialog.prototype, "cancel");
		const dialog = new this.TestDialog();
		dialog.activate();
		dialog.element.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
		expect(this.TestDialog.prototype.cancel)
			.toHaveBeenCalled();
	});

	it("should reject on cancel", async function () {
		let error;
		const dialog = new this.TestDialog();
		const promise = dialog.activate();
		dialog.cancel();
		try {
			await promise;
		} catch (ex) {
			error = !ex;
		}
		expect(error)
			.toBeTruthy();
	});

	it("should call this.hide on cancel", function () {
		spyOn(this.TestDialog.prototype, "hide");
		const dialog = new this.TestDialog();
		dialog.activate()
			.catch(_ => {});
		dialog.cancel();
		expect(this.TestDialog.prototype.hide)
			.toHaveBeenCalled();
	});

	it("should destroy the modal panel on cancel", function () {
		const dialog = new this.TestDialog();
		dialog.activate()
			.catch(_ => {});
		spyOn(dialog.modalPanel, "destroy");
		dialog.cancel();
		expect(dialog.modalPanel.destroy)
			.toHaveBeenCalled();
	});

	it("should call this.validate on accept", function () {
		spyOn(this.TestDialog.prototype, "validate");
		const dialog = new this.TestDialog();
		dialog.activate();
		dialog.accept();
		expect(this.TestDialog.prototype.validate)
			.toHaveBeenCalled();
	});

	it("should return without resolving on this.validate returning non-array on accept", async function () {
		this.TestDialog.prototype.validate = (_ => false);
		const dialog = new this.TestDialog();
		const promise = dialog.activate();
		dialog.accept();
		dialog.cancel();
		let error;
		try {
			await promise;
		} catch (ex) {
			error = true;
		}
		expect(error)
			.toBeTruthy();
	});

	it("should resolve to an array on accept", async function () {
		const dialog = new this.TestDialog();
		const promise = dialog.activate();
		dialog.accept();
		dialog.cancel();
		let error;
		try {
			await promise;
		} catch (ex) {
			error = true;
		}
		expect(error)
			.toBeFalsy();
	});

	it("should call this.hide on accept", function () {
		spyOn(this.TestDialog.prototype, "hide");
		const dialog = new this.TestDialog();
		dialog.activate();
		dialog.accept();
		expect(this.TestDialog.prototype.hide)
			.toHaveBeenCalled();
	});

	it("should destroy the modal panel on accept", function () {
		const dialog = new this.TestDialog();
		dialog.activate();
		spyOn(dialog.modalPanel, "destroy");
		dialog.accept();
		expect(dialog.modalPanel.destroy)
			.toHaveBeenCalled();
	});

	it("should set the title to this.title()", function () {
		const dialog = new this.TestDialog();
		dialog.activate();
		const title = dialog.element.querySelector(".title")
			.textContent;
		expect(title)
			.toBe("test-title");
	});

	it("should set the body to this.body()", function () {
		const dialog = new this.TestDialog();
		dialog.activate();
		const body = dialog.element.querySelector("#test-body");
		expect(body)
			.not.toBeNull();
	});

	it("should set the buttons to this.buttons()", function () {
		const dialog = new this.TestDialog();
		dialog.activate();
		const buttons = dialog.element.querySelector("#test-buttons");
		expect(buttons)
			.not.toBeNull();
	});
});
