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
- [Merge Branch...](#merge-branch)
- [Switch Branch...](#switch-branch)
- [Create Branch...](#create-branch)
- [Delete Branch...](#delete-branch)
- [Initialize](#initialize)
- [Log](#log)
- [Diff](#diff)
- [Run Command...](#run-command)
- [Refresh](#refresh)

## Commit...

`git-menu:commit`

You can commit a single file or multiple files or folders selected in the tree-view.
This command will bring up a dialog window where you can unselect any files you do not want to commit.

You can also choose to amend the last commit with the selected files and/or optionally change the last commit message.

You then have the following options to commit the message/files:

- "Commit" will just commit the files.
- "Commit & Push" will commit the files then push them to origin.
- "Commit & Sync" will commit the files, pull from origin then push to origin.

## Commit All...

`git-menu:commit-all`

Same as [Commit...](#commit) but will list all changed files in the dialog.

## Commit Staged...

`git-menu:commit-staged`

Same as [Commit...](#commit) but will list only staged changes in the dialog.

## Stage Changes

`git-menu:stage-changes`

Stage changes for committing later.

## Add To Last Commit

`git-menu:add-to-last-commit`

This will add the selected files to the last commit.

If you want to change the message of the last commit you will have to choose [Commit...](#commit) or [Commit All...](#commit-all).

## Undo Last Commit

`git-menu:undo-last-commit`

This will undo the last commit but save the changes. Like `git reset --mixed HEAD~1`.

## Discard Changes

`git-menu:discard-changes`

This will discard changes to the selected files.

## Discard All Changes

`git-menu:discard-all-changes`

This will discard changes to the all files in the repo.

## Ignore Changes

`git-menu:ignore-changes`

Update the index with the changed version but don't commit the changes. Like `git update-index --assume-unchanged`.

## Unignore Changes

`git-menu:unignore-changes`

Opposite of [Ignore Changes](#ignore-changes). Like `git update-index --no-assume-unchanged`.

## Stash Changes

`git-menu:stash-changes`

Save changes and checkout last commit.

## Unstash Changes

`git-menu:unstash-changes`

Restore changes from last stash.

## Fetch

`git-menu:fetch`

Fetch from all tracked repos.

## Fetch All

`git-menu:fetch-all`

Fetch all project repos.

## Pull

`git-menu:pull`

Pull from tracked upstream.

## Pull All

`git-menu:pull-all`

Pull all project repos.

## Push

`git-menu:push`

Push to tracked upstream.

## Push All

`git-menu:push-all`

Push all project repos.

## Sync

`git-menu:sync`

Pull then Push.

## Sync All

`git-menu:sync-all`

Pull then Push all project repos.

## Merge Branch...

`git-menu:merge-branch`

Merge or rebase a branch.

## Switch Branch...

`git-menu:switch-branch`

Checkout a different branch in this repo.

## Create Branch...

`git-menu:create-branch`

Create a branch and optionally track/create a remote branch.

## Delete Branch...

`git-menu:delete-branch`

Delete a local and/or remote branch.

## Initialize

`git-menu:init`

Initialize a git repo for the current project.

## Log

`git-menu:log`

Show the git log.

## Diff

`git-menu:diff`

Open the diff patch in a new editor.

## Run Command...

`git-menu:run-command`

Run any `git` command with selected `%files%` as an argument.

## Refresh

`git-menu:refresh`

Refresh the git status in Atom.
