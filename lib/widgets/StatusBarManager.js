/** @babel */

export default class StatusBarManager {

	constructor(statusBar) {

		this.progressBar = document.createElement("progress");

		this.label = document.createElement("span");
		this.label.innerHTML = "git-menu";

		this.element = document.createElement("div");
		this.element.classList.add("git-menu", "status");
		this.element.appendChild(this.progressBar);
		this.element.appendChild(this.label);

		this.hide();

		this.tile = statusBar.addRightTile({
			item: this.element,
			priority: Number.MAX_SAFE_INTEGER
		});
	}

	destroy() {
		this.tile.destroy();
		this.tile = null;
	}

	show(label, progress) {
		if (typeof label !== "undefined") {
			this.setLabel(label);
		}
		if (typeof progress !== "undefined") {
			this.setProgress(progress);
		}
		this.element.classList.remove("hidden");
	}

	hide() {
		this.element.classList.add("hidden");
	}

	setLabel(label) {
		this.label.innerHTML = label;
	}

	setProgress(progress) {
		const prog = parseInt(progress, 10);
		// check if progress is a number
		if (isNaN(prog)) {
			// set progress to indeterminate
			this.progressBar.removeAttribute("value");
		} else {
			this.progressBar.value = prog;
		}
	}

	setProgressMax(max) {
		this.progressBar.max = max;
	}
}
