/** @babel */

import gitCmd from "../git-cmd";
import helper from "../helper";
import Notifications from "../Notifications";

import {command as sync} from "./sync";
import {command as push} from "./push";
import CommitDialog from "../dialogs/CommitDialog";

export default {
	label: "Commit Staged...",
	description: "Commit staged files",
	async command(filePaths, statusBar, git = gitCmd, notifications = Notifications, dialog = CommitDialog, title = "Commit Staged") {
		const [files, root] = await helper.getRootAndFilesStatuses(atom.project.getPaths(), git);
		const stagedFiles = files.filter(f => f.added);
		if (stagedFiles.length === 0) {
			throw "No Changes Staged";
		}
		await helper.checkGitLock(root);
		const lastCommit = await git.lastCommit(root);
		const [
			message,
			amend,
			shouldPush,
			shouldSync
		] = await new dialog({files: stagedFiles, lastCommit, filesSelectable: false}).activate();

		if (!message) {
			throw "Message cannot be blank.";
		}

		// commit files
		statusBar.show("Committing...");
		const numFiles = `${stagedFiles.length} File${stagedFiles.length !== 1 ? "s" : ""}`;
		await helper.checkGitLock(root);
		const results = await git.commit(root, message, amend, null);
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
