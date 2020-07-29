/** @babel */

export default class StatusBarManager {

	constructor() {
		this.busySignal = null;
		this.tile = null;
		this.onDidClick = null;
		this.element = null;
		this.progressBar = null;
		this.label = null;
	}

	addBusySignal(busySignal) {
		if (this.busySignal) {
			this.busySignal.dispose();
		}
		if (this.tile) {
			this.tile.destroy();
			this.tile = null;
			this.onDidClick = null;
			this.element = null;
			this.progressBar = null;
			this.label = null;
		}

		this.busySignal = busySignal;
	}

	addStatusBar(statusBar) {
		if (this.busySignal) {
			// prefer busy signal
			return;
		}

		if (this.tile) {
			this.tile.destroy();
		}


		this.progressBar = document.createElement("progress");

		this.label = document.createElement("span");
		this.label.innerHTML = "git-menu";

		this.element = document.createElement("div");
		this.element.classList.add("git-menu", "status", "hidden");
		this.element.appendChild(this.progressBar);
		this.element.appendChild(this.label);

		this.onDidClick = null;

		this.tile = statusBar.addRightTile({
			item: this.element,
			priority: Number.MAX_SAFE_INTEGER,
		});
	}

	destroy() {
		if (this.tile) {
			this.tile.destroy();
			this.tile = null;
			this.onDidClick = null;
			this.element = null;
			this.progressBar = null;
			this.label = null;
		}
		if (this.busySignal) {
			this.busySignal.dispose();
			this.busySignal = null;
		}
	}

	show(label, opts = null) {
		if (opts === null || typeof opts === "number") {
			// eslint-disable-next-line no-param-reassign
			opts = {
				progress: opts,
			};
		}

		if (opts instanceof Promise) {
			// eslint-disable-next-line no-param-reassign
			opts = {
				promise: opts,
			};
		} else if (typeof opts === "function" || (opts && opts.then)) {
			// eslint-disable-next-line no-param-reassign
			opts = {
				promise: Promise.resolve(opts),
			};
		}

		if (this.tile) {
			if (this.onDidClick) {
				this.element.removeEventListener("click", this.onDidClick);
				this.onDidClick = null;
			}

			if (typeof label !== "undefined") {
				this.setLabel(label);
			}
			if ("progress" in opts) {
				this.setProgress(opts.progress);
			}
			this.element.classList.remove("hidden");
			if (opts.onDidClick) {
				this.onDidClick = opts.onDidClick;
				this.element.addEventListener("click", this.onDidClick);
			}
		}

		if (this.busySignal) {
			const busySignalOpts = {
				revealTooltip: ("revealTooltip" in opts) ? !!opts.revealTooltip : true,
			};
			if (opts.waitingFor) {
				busySignalOpts.waitingFor = opts.waitingFor;
			}
			if (opts.onDidClick) {
				busySignalOpts.onDidClick = opts.onDidClick;
			}
			if (!opts.append && this.lastBusyMessage) {
				this.lastBusyMessage.dispose();
				this.lastBusyMessage = null;
			}
			if (opts.promise) {
				return this.busySignal.reportBusyWhile(label, () => opts.promise, busySignalOpts);
			}

			this.lastBusyMessage = this.busySignal.reportBusy(label, busySignalOpts);
			return this.lastBusyMessage;
		}
	}

	hide(busyMessage) {
		if (this.tile) {
			this.element.classList.add("hidden");

			if (this.onDidClick) {
				this.element.removeEventListener("click", this.onDidClick);
				this.onDidClick = null;
			}
		}

		if (this.busySignal) {
			if (busyMessage) {
				busyMessage.dispose();
				if (this.lastBusyMessage === busyMessage) {
					this.lastBusyMessage = null;
				}
			} else if (this.lastBusyMessage) {
				this.lastBusyMessage.dispose();
				this.lastBusyMessage = null;
			}
		}
	}

	setLabel(label, busyMessage) {
		if (this.tile) {
			this.label.innerHTML = label;
		}

		if (this.busySignal) {
			if (busyMessage) {
				busyMessage.setTitle(label);
			} else if (this.lastBusyMessage) {
				this.lastBusyMessage.setTitle(label);
			} else {
				return this.show(label);
			}
		}
	}

	setProgress(progress) {
		if (this.tile) {
			const prog = parseInt(progress, 10);
			// check if progress is a number
			if (isNaN(prog)) {
				// set progress to indeterminate
				this.progressBar.removeAttribute("value");
			} else {
				this.progressBar.value = prog;
			}
		}
	}

	setProgressMax(max) {
		if (this.tile) {
			this.progressBar.max = max;
		}
	}
}
