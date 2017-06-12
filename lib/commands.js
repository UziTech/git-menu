"use babel";

import commit from "./commands/commit";
import commitAll from "./commands/commit-all";
import addToLastCommit from "./commands/add-to-last-commit";
import undoLastCommit from "./commands/undo-last-commit";
import discardChanges from "./commands/discard-changes";
import discardAllChanges from "./commands/discard-all-changes";
import pull from "./commands/pull";
import push from "./commands/push";
import pullAndPush from "./commands/pull-&-push";
import switchBranch from "./commands/switch-branch";
import createBranch from "./commands/create-branch";
import ignoreChanges from "./commands/ignore-changes";
import unignoreChanges from "./commands/unignore-changes";
import init from "./commands/init";
import refresh from "./commands/refresh";
import fetch from "./commands/fetch";
import stashChanges from "./commands/stash-changes";
import unstashChanges from "./commands/unstash-changes";
import runCommand from "./commands/run-command";

/**
 * These commands will be added to the context menu in the order they appear here.
 * They can include the following properties:
 * {
 *   label: (required) The text to display on the context menu item
 *   description: (optional) A description that will be displayed by the enable/disable setting
 *   keymap: (optional) A key combination to add as a default keybinding
 *   confirm: (optional) If the command requires a confirm dialog you can supply the `message` and `detailedMessage` parameters
 *     message: (required) This is the question you are asking the user to confirm.
 *     detailedMessage: (optional) This is where you can provide a more detailed list of the changes.
 *                                 This can be a string or a function that will be called with the `filePaths` parameter that returns a string
 *                                 This function can be asynchronous
 *   command: (required) The asynchronous function to run when the command is called.
 *                       This function will be called with the parameters `filePaths` and `statusBar`.
 * }
 */
export default {
	"commit": commit,
	"commit-all": commitAll,
	"add-to-last-commit": addToLastCommit,
	"undo-last-commit": undoLastCommit,
	"discard-changes": discardChanges,
	"discard-all-changes": discardAllChanges,
	"pull": pull,
	"push": push,
	"pull-&-push": pullAndPush,
	"switch-branch": switchBranch,
	"create-branch": createBranch,
	"ignore-changes": ignoreChanges,
	"unignore-changes": unignoreChanges,
	"init": init,
	"refresh": refresh,
	"fetch": fetch,
	"stash-changes": stashChanges,
	"unstash-changes": unstashChanges,
	"run-command": runCommand,
};
