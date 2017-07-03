"use babel";

import path from "path";
import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications, { isVerbose } from "../Notifications";

import { command as pullAndpush } from "./pull-&-push";
import { command as push } from "./push";
import CommitDialog from "../dialogs/CommitDialog";

export default {
	label: "Commit...",
	description: "Commit selected files",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog) {
		const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
		await helper.checkGitLock(root, git);
		const lastCommit = await git.lastCommit(root);
		const [
				message,
				amend,
				shouldPush,
				shouldPull,
				selectedFiles
			] = await new dialog({ files, lastCommit }).activate();

		if (!message) {
			throw "Message cannot be blank.";
		}

		// commit files
		statusBar.show("Committing...", null);
		const reducedFiles = await helper.reduceFilesToCommonFolders(root, selectedFiles, git);
		const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
		await helper.checkGitLock(root, git);
		await git.unstage(root);
		await helper.checkGitLock(root, git);
		await git.add(root, reducedFiles);
		await helper.checkGitLock(root, git);
		const result = await git.commit(root, message, amend, null, isVerbose());
		notifications.addGit(result);
		helper.refreshAtom(root);
		if (shouldPull) {
			await pullAndpush([root], statusBar, git, notifications);
			return numFiles + " committed & pulled & pushed.";
		} else if (shouldPush) {
			await push([root], statusBar, git, notifications);
			return numFiles + " committed & pushed.";
		}
		return numFiles + " committed.";
	},
};
