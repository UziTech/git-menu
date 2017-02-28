<!-- [![Throughput Graph](https://graphs.waffle.io/UziTech/context-git/throughput.svg)](https://waffle.io/UziTech/context-git/metrics) -->
[![Build Status](https://travis-ci.org/UziTech/context-git.svg?branch=master)](https://travis-ci.org/UziTech/context-git)
[![Build status](https://ci.appveyor.com/api/projects/status/649me6gpm37u4tja?svg=true)](https://ci.appveyor.com/project/UziTech/context-git)
[![Code Climate](https://codeclimate.com/github/UziTech/context-git/badges/gpa.svg)](https://codeclimate.com/github/UziTech/context-git)
[![Dependency Status](https://david-dm.org/UziTech/context-git.svg)](https://david-dm.org/UziTech/context-git)

# context-git package

An Atom.io package to use git from the context menu. You can choose which commands show up in the context menu by enabling/disabling them in the settings.

![screenshpt](https://uzitech.github.io/context-git/screenshots/context-git 0.11.0 full.gif)

## Usage

This package will add a "Git" item to the context menu when you right click on the tree-view, tabs, or the editor.

## Commands

### Commit...

You can commit a single file or multiple files or folders selected in the tree-view. This command will bring up a dialog window where you can deselect any files you do not want to commit.

You can also choose to amend the last commit with the selected files and/or optionally change the last commit message.

You then have the following options to commit the message/files:

-   "Commit" will just commit the files.
-   "Commit & Push" will commit the files then push them to origin.
-   "Commit & Pull & Push" will commit the files, pull from origin then push to origin.

### Commit All...

Same as [Commit...](#commit) but will list all changed files in the dialog

### Discard Changes

This will discard changes to the selected files.

### Discard All Changes

This will discard changes to the all files in the repo.

### Add To Last Commit

This will add the selected files to the last commit.

If you want to change the message of the last commit you will have to choose [Commit...](#commit) or [CommitAll...](#commit-all)

### Undo Last Commit

This will undo the last commit but save the changes. Like `git reset --mixed HEAD~1`

### Switch Branch

Checkout a different branch in this repo.

### Create Branch

Create a branch and optionally track/create a remote branch.

### Ignore Changes

Update the index with the changed version but don't commit the changes. Like `git update-index --assume-unchanged`

### Unignore Changes

Opposite of [Ignore Changes](#ignore-changes). Like `git update-index --no-assume-unchanged`

### Pull

Pull from tracked upstream

### Push

Push to tracked upstream

### Pull & Push

Pull then Push

### Initialize

Initialize a git repo for the current project.

### Refresh

Refresh the git status in Atom.
