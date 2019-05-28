<!-- lint disable list-item-indent -->

# Commands

- [Commit...](#commit)
- [Commit All...](#commit-all)
- [Commit Staged...](#commit-staged)
- [Stage Changes](#stage-changes)
- [Add To Last Commit](#add-to-last-commit)
- [Undo Last Commit](#undo-last-commit)
- [Discard Changes](#discard-changes)
- [Discard All Changes](#discard-all-changes)
- [Ignore Changes](#ignore-changes)
- [Unignore Changes](#unignore-changes)
- [Stash Changes](#stash-changes)
- [Unstash Changes](#unstash-changes)
- [Fetch](#fetch)
- [Fetch All](#fetch-all)
- [Pull](#pull)
- [Pull All](#pull-all)
- [Push](#push)
- [Push All](#push-all)
- [Sync](#sync)
- [Sync All](#sync-all)
- [Merge Branch](#merge-branch)
- [Switch Branch](#switch-branch)
- [Create Branch](#create-branch)
- [Delete Branch](#delete-branch)
- [Initialize](#initialize)
- [Log](#log)
- [Diff](#diff)
- [Run Command](#run-command)
- [Refresh](#refresh)

## Commit...

You can commit a single file or multiple files or folders selected in the tree-view.
This command will bring up a dialog window where you can unselect any files you do not want to commit.

You can also choose to amend the last commit with the selected files and/or optionally change the last commit message.

You then have the following options to commit the message/files:

- "Commit" will just commit the files.
- "Commit & Push" will commit the files then push them to origin.
- "Commit & Sync" will commit the files, pull from origin then push to origin.

## Commit All...

Same as [Commit...](#commit) but will list all changed files in the dialog.

## Commit Staged...

Same as [Commit...](#commit) but will list only staged changes in the dialog.

## Stage Changes

Stage changes for committing later.

## Add To Last Commit

This will add the selected files to the last commit.

If you want to change the message of the last commit you will have to choose [Commit...](#commit) or [Commit All...](#commit-all).

## Undo Last Commit

This will undo the last commit but save the changes. Like `git reset --mixed HEAD~1`.

## Discard Changes

This will discard changes to the selected files.

## Discard All Changes

This will discard changes to the all files in the repo.

## Ignore Changes

Update the index with the changed version but don't commit the changes. Like `git update-index --assume-unchanged`.

## Unignore Changes

Opposite of [Ignore Changes](#ignore-changes). Like `git update-index --no-assume-unchanged`.

## Stash Changes

Save changes and checkout last commit.

## Unstash Changes

Restore changes from last stash.

## Fetch

Fetch from all tracked repos.

## Fetch All

Fetch all project repos.

## Pull

Pull from tracked upstream.

## Pull All

Pull all project repos.

## Push

Push to tracked upstream.

## Push All

Push all project repos.

## Sync

Pull then Push.

## Sync All

Pull then Push all project repos.

## Merge Branch

Merge or rebase a branch.

## Switch Branch

Checkout a different branch in this repo.

## Create Branch

Create a branch and optionally track/create a remote branch.

## Delete Branch

Delete a local and/or remote branch.

## Initialize

Initialize a git repo for the current project.

## Log

Show the git log.

## Diff

Open the diff patch in a new editor.

## Run Command

Run any `git` command with selected `%files%` as an argument.

## Refresh

Refresh the git status in Atom.
