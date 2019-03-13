/** @babel */

import commit from "./commands/commit";
import commitAll from "./commands/commit-all";
import commitStaged from "./commands/commit-staged";
import stageChanges from "./commands/stage-changes";
import addToLastCommit from "./commands/add-to-last-commit";
import undoLastCommit from "./commands/undo-last-commit";
import discardChanges from "./commands/discard-changes";
import discardAllChanges from "./commands/discard-all-changes";
import pull from "./commands/pull";
import push from "./commands/push";
import sync from "./commands/sync";
import mergeBranch from "./commands/merge-branch";
import switchBranch from "./commands/switch-branch";
import createBranch from "./commands/create-branch";
import deleteBranch from "./commands/delete-branch";
import ignoreChanges from "./commands/ignore-changes";
import unignoreChanges from "./commands/unignore-changes";
import init from "./commands/init";
import refresh from "./commands/refresh";
import fetch from "./commands/fetch";
import stashChanges from "./commands/stash-changes";
import unstashChanges from "./commands/unstash-changes";
import runCommand from "./commands/run-command";
import log from "./commands/log";
import diff from "./commands/diff";

/**
 * These commands will be added to the context menu in the order they appear here.
 * They can include the following properties:
 * {
 *   label: (required) The text to display on the context menu item
 *   description: (optional) A description that will be displayed by the enable/disable setting
 *   keymap: (optional) A key combination to add as a default keybinding
 *   confirm: (optional) If the command requires a confirm dialog you can supply the `message` and `detail` parameters
 *     message: (required) This is the question you are asking the user to confirm.
 *     detail: (optional) This is where you can provide a more detailed list of the changes.
 *                                 This can be a string or a function that will be called with the `filePaths` parameter that returns a string
 *                                 This function can be asynchronous
 *   command: (required) The asynchronous function to run when the command is called.
 *                       This function will be called with the parameters `filePaths` and `statusBar`.
 *                       This function should ultimately resolve to an object with the following properties:
 *                         .title: A title for the command
 *                         .message: A success message to display to the user
 * }
 */
export default {
	"commit": commit,
	"commit-all": commitAll,
	"commit-staged": commitStaged,
	"stage-changes": stageChanges,
	"add-to-last-commit": addToLastCommit,
	"undo-last-commit": undoLastCommit,
	"discard-changes": discardChanges,
	"discard-all-changes": discardAllChanges,
	"pull": pull,
	"push": push,
	"sync": sync,
	"merge-branch": mergeBranch,
	"switch-branch": switchBranch,
	"create-branch": createBranch,
	"delete-branch": deleteBranch,
	"ignore-changes": ignoreChanges,
	"unignore-changes": unignoreChanges,
	"init": init,
	"refresh": refresh,
	"fetch": fetch,
	"stash-changes": stashChanges,
	"unstash-changes": unstashChanges,
	"run-command": runCommand,
	"log": log,
	"diff": diff,
};
