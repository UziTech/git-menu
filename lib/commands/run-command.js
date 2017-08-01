"use babel";

import path from "path";
import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";
import RunCommandDialog from "../dialogs/RunCommandDialog";
import stringArgv from "string-argv";

export default {
	label: "Run Command...",
	description: "Run a git command",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = RunCommandDialog, title = "Run Command") {
		const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
		await helper.checkGitLock(root);
		const [gitCommand, selectedFiles] = await new dialog({ files })
			.activate();
		if (!gitCommand) {
			throw "Command cannot be blank.";
		}
		const trimmedGitCommand = gitCommand.trim()
			.replace(/^git /, "");

		statusBar.show("Running...", null);
		const selectedFilePaths = selectedFiles.map(file => path.join(root, file));
		const numFiles = selectedFiles.length + " file" + (selectedFiles.length !== 1 ? "s" : "");
		let includedFiles = false;
		const gitArgs = stringArgv(trimmedGitCommand)
			.reduce((prev, arg) => {
				if (arg === "%files%") {
					includedFiles = true;
					selectedFilePaths.forEach(file => {
						prev.push(file);
					});
				} else {
					prev.push(arg);
				}
				return prev;
			}, []);

		await helper.checkGitLock(root);
		const result = await git.cmd(root, gitArgs);
		notifications.addGit(gitCommand, result);
		helper.refreshAtom(root);
		return {
			title,
			message: "Ran 'git " + trimmedGitCommand + "'" + (includedFiles ? " with " + numFiles + "." : ""),
		};
	}
};
