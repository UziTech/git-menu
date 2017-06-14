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
		const lastCommit = await git.lastCommit(root);
		const [
				message,
				amend,
				shouldPush,
				shouldPull,
				selectedFiles
			] = await new dialog({ files, lastCommit })
			.activate();

		if (!message) {
			throw "Message cannot be blank.";
		}

		// commit files
		statusBar.show("Committing...", null);
		const selectedFilePaths = selectedFiles.map(file => path.join(root, file));
		const numFiles = selectedFiles.length + " File" + (selectedFiles.length !== 1 ? "s" : "");
		await git.add(root, selectedFilePaths);
		const result = await git.commit(root, message, amend, selectedFilePaths, isVerbose());
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
