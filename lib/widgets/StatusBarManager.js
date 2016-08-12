class StatusBarManager {

	constructor(statusBar) {

		this.progressBar = document.createElement("progress");

		this.label = document.createElement("span");
		this.label.innerHTML = "context-git";

		this.element = document.createElement("div");
		this.element.classList.add("context-git", "status");
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
		progress = parseInt(progress, 10);
		// check if progress is a number
		if (!isNaN(progress)) {
			this.progressBar.value = progress;
		} else {
			// set progress to indeterminate
			const progressBar = document.createElement("progress");
			this.element.replaceChild(progressBar, this.progressBar);
			this.progressBar = progressBar;
		}
	}

	setProgressMax(max) {
		this.progressBar.max = max;
	}
}

module.exports = StatusBarManager;
