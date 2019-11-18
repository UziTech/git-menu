/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

import {command as sync} from "./sync";
import {command as push} from "./push";
import CommitDialog from "../dialogs/CommitDialog";

export default {
	label: "Commit...",
	description: "Commit selected files",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog, title = "Commit") {
		const [files, root] = await helper.getRootAndFilesStatuses(filePaths, git);
		await helper.checkGitLock(root);
		const treeView = atom.config.get("git-menu.treeView");
		const lastCommit = await git.lastCommit(root);
		const [
			message,
			amend,
			shouldPush,
			shouldSync,
			selectedFiles
		] = await new dialog({files, lastCommit, treeView}).activate();

		if (!message) {
			throw "Message cannot be blank.";
		}

		// commit files
		statusBar.show("Committing...");
		const changedFiles = (await helper.getStatuses([root], git)).map(status => status.file);
		const reducedFiles = helper.reduceFilesToCommonFolders(selectedFiles, changedFiles);
		const numFiles = `${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""}`;
		await helper.checkGitLock(root);
		const results = [];
		results.push(await git.unstage(root));
		results.push(await git.add(root, reducedFiles));
		results.push(await git.commit(root, message, amend, null));
		localStorage.removeItem("git-menu.commit-message");
		notifications.addGit(title, results);
		helper.refreshAtom(root);
		const success = {title, message: `${numFiles} committed.`};
		if (shouldSync) {
			await sync([root], statusBar, git, notifications);
			success.message = `${numFiles} committed & synced.`;
		} else if (shouldPush) {
			await push([root], statusBar, git, notifications);
			success.message = `${numFiles} committed & pushed.`;
		}
		return success;
	},
};
