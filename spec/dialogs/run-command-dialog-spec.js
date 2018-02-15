/** @babel */

import RunCommandDialog from "../../lib/dialogs/RunCommandDialog";
import {fileStatus, files} from "../mocks";

describe("RunCommandDialog", function () {
	beforeEach(function () {
		this.files = [fileStatus("M ", files.t1)];
	});

	it("initial state includes files", function () {
		const dialog = new RunCommandDialog({files: this.files});
		expect(dialog.state.files.length).toBe(this.files.length);
	});

	it("should return files and command on accept", async function () {
		const dialog = new RunCommandDialog({files: this.files});
		const promise = dialog.activate();
		dialog.state.command = "command";
		dialog.accept();
		const ret = await promise;
		expect(ret[0]).toBe("command");
		expect(ret[1][0]).toBe(files.t1);
	});
});
