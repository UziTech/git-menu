"use babel";
/* globals atom */

import { $, View } from "atom-space-pen-views";

export default class Dialog extends View {
	static content() {
		this.div({ class: "dialog context-git", keyup: "keyup" }, () => {
			this.div({ class: "heading" }, () => {
				this.i({ class: "icon x clickable", click: "cancel" });
				this.strong("Commit");
			});
			this.div({ class: "body" }, () => {
				this.label("Files");
				this.div({ class: "files", outlet: "files" });
				this.label("Message");
				this.textarea({ class: "message native-key-bindings", outlet: "message", keyUp: "messageKeyUp" });
				this.label(() => {
					this.text("Amend last commit");
					this.input({ type: "checkbox", class: "checkbox amend", outlet: "amend", change: "amendChange" });
				});
			});
			this.div({ class: "buttons" }, () => {
				this.button({ class: "active", click: "commit" }, () => {
					this.i({ class: "icon commit" });
					this.span("Commit");
				});
				this.button({ click: "commitPush" }, () => {
					this.i({ class: "icon push" });
					this.span("Commit & Push");
				});
				this.button({ click: "commitPullPush" }, () => {
					this.i({ class: "icon pull" });
					this.span("Commit & Pull & Push");
				});
				this.button({ click: "cancel" }, () => {
					this.i({ class: "icon x" });
					this.span("Cancel");
				});
			});
		});
	}

	activate(files, lastCommit) {
		this.files.html(files.map(function (file) {
			let $checkbox = $("<input />").attr({ type: "checkbox" }).prop({ checked: true });
			let $span = $("<span />").text(file.file);
			let $label = $("<label />").append($checkbox, $span);
			let $file = $("<div />").addClass("file").append($label);

			if (file.added) { $file.addClass("added"); }
			if (file.untracked) { $file.addClass("untracked"); }
			if (file.deleted) { $file.addClass("deleted"); }
			if (file.changed) { $file.addClass("changed"); }

			return $file;
		}));
		this.lastCommit = lastCommit;
		this.amend.prop({ checked: false });
		if (lastCommit === null) {
			this.amend.prop({ disabled: true });
		}
		this.message.val("");
		this.show();
		this.message.focus();
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	deactivate() {
		this.modalPanel.destroy();
		this.detach();
	}

	keyup(event, dialog) {
		if (event.keyCode === 27) { this.cancel(); }
	}

	getFiles() {
		return $.makeArray(this.files.find(".file").filter((i, el) => $(el).find("input").prop("checked")).map((i, el) => $(el).find("label").text()));
	}

	cancel() {
		this.reject();
		this.deactivate();
	}

	messageKeyUp() {
		let message = this.message.val();
		let lines = message.split("\n");

		let error = message === "";
		let tooLong = lines.some((line, idx) => ((idx === 1) && (line.length > 50)) || (line.length > 80));

		this.message.toggleClass("error", error);
		this.message.toggleClass("too-long", tooLong);
	}

	amendChange() {
		if (this.amend.prop("checked")) {
			if (this.message.val() === "") {
				this.message.val(this.lastCommit);
				this.messageKeyUp;
			}
		} else {
			if (this.message.val() === this.lastCommit) {
				this.message.val("");
				this.messageKeyUp;
			}
		}
	}

	show() {
		return this.modalPanel = atom.workspace.addModalPanel({ item: this, visible: true });
	}

	doCommit(push, pull) {
		let message = this.message.val();
		if (message === "") {
			this.message.addClass("error").focus();
			return;
		}
		this.resolve([
      this.message.val(),
      this.amend.prop("checked"),
      push,
      pull,
      this.getFiles()
    ]);
		this.deactivate();
	}

	commit() {
		this.doCommit(false, false);
	}

	commitPush() {
		this.doCommit(true, false);
	}

	commitPullPush() {
		this.doCommit(true, true);
	}
};
