"use babel";
/* globals atom */

import { $, View } from "atom-space-pen-views";
import git from "../git-cmd";

export default class Dialog extends View {
	static content() {
		this.div({ class: "dialog context-git", keyup: "keyup" }, () => {
			this.div({ class: "heading" }, () => {
				this.i({ class: "icon x clickable", click: "cancel" });
				this.strong("Switch Branch");
			});
			this.div({ class: "body" }, () => {
				this.label("Select A Branch");
				this.select({ class: "native-key-bindings", tabindex:"0", outlet: "branches" });
			});
			this.div({ class: "buttons" }, () => {
				this.button({ class: "active", click: "switch", outlet: "switchButton" }, () => {
					this.i({ class: "icon branch" });
					this.span("Switch Branch");
				});
				this.button({ click: "fetch" }, () => {
					this.i({ class: "icon sync" });
					this.span("Fetch");
				});
				this.button({ click: "cancel" }, () => {
					this.i({ class: "icon x" });
					this.span("Cancel");
				});
			});
		});
	}

	activate(branches, root) {
		this.root = root;
		this.listBranches(branches);
		this.show();
		this.branches.focus();
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	listBranches(branches) {
		this.branches.html(branches.map(function (branch) {
			let $option = $("<option />").attr({ value: branch.name }).text(branch.path);
			if (branch.selected) { $option.attr("selected", "selected"); }
			return $option;
		}));
	}

	deactivate() {
		this.modalPanel.destroy();
		this.detach();
	}

	keyup(event, dialog) {
		if (event.keyCode === 27) { this.cancel(); }
		if (event.keyCode === 13) { this.switch(); }
	}

	cancel() {
		this.reject();
		this.deactivate();
	}

	show() {
		return this.modalPanel = atom.workspace.addModalPanel({ item: this, visible: true });
	}

	switch () {
		let branch = this.branches.val();
		this.resolve(branch);
		this.deactivate();
	}

	fetch() {
		this.listBranches([{ name: "", path: "Fetching...", selected: true }]);
		this.branches.prop({ disabled: true });
		this.switchButton.prop({ disabled: true });
		git.fetch(this.root)
			.then(() => git.branches(this.root))
			.then(branches => {
				this.listBranches(branches);
				this.branches.prop({ disabled: false });
				this.switchButton.prop({ disabled: false });
			});
	}
};
