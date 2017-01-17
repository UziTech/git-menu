# context-git package

An Atom.io package to use git from the context menu.

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

Same as [Commit...](#commit) but will list all changed file in the dialog

### Discard Changes

This will discard changes to the selected files.

### Add To Last Commit

This will add the selected files to the last commit.

If you want to change the message of the last commit you will have to choose [Commit...](#commit)

### Undo Last Commit

This will undo the last commit but save the changes. Like `git reset --mixed HEAD~1`

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
