"use babel";
/* globals atom */

import {
	View
} from "atom-space-pen-views";

export default class DialogView extends View {

	content() {
		console.log("content");
		this.div({
			class: "dialog context-git"
		}, () => {
			this.div({
				class: "heading"
			}, () => {
				this.i({
					class: "icon x clickable",
					click: "cancel"
				});
				this.strong("Commit");
			});
			this.div({
				class: "body"
			}, () => {
				this.label("Commit Message");
				this.textarea({
					class: "native-key-bindings",
					outlet: "msg",
					keyUp: "colorLength"
				});
			});
			this.div({
				class: "buttons"
			}, () => {
				this.button({
					class: "active",
					click: "commit"
				}, () => {
					this.i({
						class: "icon commit"
					});
					this.span("Commit");
				});
				this.button({
					click: "cancel"
				}, () => {
					this.i({
						class: "icon x"
					});
					this.span("Cancel");
				});
			});
		});
	}

	deactivate() {
		this.modalPanel.destroy();
		this.detach();
	}

	cancel() {
		this.deactivate();
	}

	activate() {
		this.msg.val("");
		this.show();
	}

	show() {
		this.modalPanel = atom.workspace.addModalPanel({
			item: this,
			visible: true
		});
	}

	colorLength() {
		const lines = this.getMessage().split("\n");
		const too_long = lines.some((line, i) => {
			return (i === 0 && line.length > 50) || (i > 0 && line.length > 80);
		});

		if (too_long) {
			this.msg.addClass("over-fifty");
		} else {
			this.msg.removeClass("over-fifty");
		}
	}

	commit() {
		this.deactivate();
		this.parentView.commit();
	}

	getMessage() {
		return this.msg.val();
	}
};
