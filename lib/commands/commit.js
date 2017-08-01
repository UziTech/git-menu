"use babel";

import path from "path";
import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

import { command as sync } from "./sync";
import { command as push } from "./push";
import CommitDialog from "../dialogs/CommitDialog";

export default {
	label: "Commit...",
	description: "Commit selected files",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog, title = "Commit") {
		const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
		await helper.checkGitLock(root);
		const lastCommit = await git.lastCommit(root);
		const [
				message,
				amend,
				shouldPush,
				shouldSync,
				selectedFiles
			] = await new dialog({ files, lastCommit }).activate();

		if (!message) {
			throw "Message cannot be blank.";
		}

		// commit files
		statusBar.show("Committing...", null);
		const changedFiles = (await helper.getStatuses([root], git)).map(status => status.file);
		const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, changedFiles);
		const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
		await helper.checkGitLock(root);
		await git.unstage(root);
		await git.add(root, reducedFiles);
		const result = await git.commit(root, message, amend, null, isVerbose());
		notifications.addGit(title, result);
		helper.refreshAtom(root);
		if (shouldSync) {
			await sync([root], statusBar, git, notifications);
			return numFiles + " committed & synced.";
		} else if (shouldPush) {
			await push([root], statusBar, git, notifications);
			return numFiles + " committed & pushed.";
		}
		return numFiles + " committed.";
	},
};
