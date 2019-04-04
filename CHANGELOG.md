## [2.0.1](https://github.com/UziTech/git-menu/compare/v2.0.0...v2.0.1) (2019-04-04)


### Bug Fixes

* **git:** Replace all slashes for root ([68293dd](https://github.com/UziTech/git-menu/commit/68293dd))
* **paths:** Get active text editor if active pane item is not a file ([3e648fc](https://github.com/UziTech/git-menu/commit/3e648fc))
* **refresh:** Fix project case mismatch ([0bc03f7](https://github.com/UziTech/git-menu/commit/0bc03f7))

# [2.0.0](https://github.com/UziTech/git-menu/compare/v1.5.0...v2.0.0) (2019-04-04)


### Bug Fixes

* **merge:** Add abort checkbox on merge dialog ([d92a166](https://github.com/UziTech/git-menu/commit/d92a166))


### Features

* **merge:** Add rebase checkbox to merge dialog ([8d43d22](https://github.com/UziTech/git-menu/commit/8d43d22))


### BREAKING CHANGES

* **merge:** Abort merge on error by default

# [1.5.0](https://github.com/UziTech/git-menu/compare/v1.4.0...v1.5.0) (2019-04-02)

### Features

* Show files as tree view in dialogs [#97](https://github.com/UziTech/git-menu/issues/97) ([41a19b7](https://github.com/UziTech/git-menu/commit/41a19b7))

# [1.4.0](https://github.com/UziTech/git-menu/compare/v1.2.0...v1.4.0) (2019-03-18)

-   Show busy signal when command starts
-   Clean up code
-   Add Diff command [#94](https://github.com/UziTech/git-menu/issues/94)

# [1.2.0](https://github.com/UziTech/git-menu/compare/v1.1.2...v1.2.0) (2019-03-07)

-   Add Merge Branch command [#91](https://github.com/UziTech/git-menu/issues/91)

# [1.1.2](https://github.com/UziTech/git-menu/compare/v1.1.1...v1.1.2) (2019-01-08)

-   Remove Synchronous Confirmation Dialogs
-   Bump minimum Atom version to 1.25.0
-   Fix first commit on a new repo [#76](https://github.com/UziTech/git-menu/issues/76)

# [1.1.1](https://github.com/UziTech/git-menu/compare/v1.1.0...v1.1.1) (2018-11-05)

-   Prevent trying to delete a branch that doesn't exist [#65](https://github.com/UziTech/git-menu/issues/65)

# [1.1.0](https://github.com/UziTech/git-menu/compare/v1.0.1...v1.1.0) (2018-11-04)

-   Use Atom IDE Busy Signal if available, instead of separate status bar item
-   Hide `context-git:*` commands in the command palette

# [1.0.1](https://github.com/UziTech/git-menu/compare/v1.0.0...v1.0.1) (2018-11-01)

-   Show an error when a `context-git:*` command is called. `git-menu:*` must be used.

# [1.0.0](https://github.com/UziTech/git-menu/compare/v0.20.0...v1.0.0) (2018-10-31)

-   Change package name to git-menu.
-   Changed default notification setting to show git output.

# [0.20.0](https://github.com/UziTech/git-menu/compare/v0.19.0...v0.20.0) (2018-02-19)

-   Use Synchronous Confirmation Dialogs in Atom <=1.24.x

# [0.19.0](https://github.com/UziTech/git-menu/compare/v0.18.2...v0.19.0) (2018-02-19)

-   Add [Commit Staged](https://github.com/UziTech/git-menu/blob/master/docs/docs.md#commit-staged) command
-   Add [Stage Changes](https://github.com/UziTech/git-menu/blob/master/docs/docs.md#stage-changes) command
-   Unstage files before Add to Last Commit
-   Add [Log](https://github.com/UziTech/git-menu/blob/master/docs/docs.md#log) command

# [0.18.2](https://github.com/UziTech/git-menu/compare/v0.18.1...v0.18.2) (2018-02-17)

-   Fix Async Dialog

# [0.18.1](https://github.com/UziTech/git-menu/compare/v0.18.0...v0.18.1) (2018-02-17)

-   Fix Create/Switch/Delete Branch

# [0.18.0](https://github.com/UziTech/git-menu/compare/v0.17.7...v0.18.0) (2018-02-15)

-   Async Confirmation Dialogs (only works in Atom >=1.25.0)

# [0.17.7](https://github.com/UziTech/git-menu/compare/v0.17.6...v0.17.7) (2017-12-12)

-   Now works with the github package

# [0.17.6](https://github.com/UziTech/git-menu/compare/v0.17.5...v0.17.6) (2017-09-27)

-   Fix notification not showing after creating an upstream branch

# [0.17.5](https://github.com/UziTech/git-menu/compare/v0.17.4...v0.17.5) (2017-09-20)

-   Include the results of multiple git calls when notification setting is set to show git output.
-   Warn about incompatibility with the `github` package [atom/github#961](https://github.com/atom/github/issues/961#issuecomment-317040677)

# [0.17.4](https://github.com/UziTech/git-menu/compare/v0.17.3...v0.17.4) (2017-08-18)

-   Remove untracked directories on Discard Changes
-   Show the command as the notification title

# [0.17.3](https://github.com/UziTech/git-menu/compare/v0.17.2...v0.17.3) (2017-07-29)

-   Git is now available in every context menu
-   Unstage files before Discard Changes
-   Fix reduce files when no files change

# [0.17.2](https://github.com/UziTech/git-menu/compare/v0.17.1...v0.17.2) (2017-07-20)

-   apm failed

# [0.17.1](https://github.com/UziTech/git-menu/compare/v0.17.0...v0.17.1) (2017-07-20)

-   Reduce files to folders on discard-changes if all changed files in a folder are selected [#16](https://github.com/UziTech/git-menu/issues/16) [#53](https://github.com/UziTech/git-menu/issues/53)
-   Shorten progress bar on status bar
-   Add command to git notifications
-   Add progress bar to branch operations
-   Change Pull & Push to Sync

# [0.17.0](https://github.com/UziTech/git-menu/compare/v0.16.2...v0.17.0) (2017-07-05)

-   If `index.lock` exists ask to remove it before running a command [#59](https://github.com/UziTech/git-menu/issues/59)
-   Dispatched commands now return a promise with hopes that [atom/atom#14931](https://github.com/atom/atom/pull/14931) will be merged
-   Fix Run Command when selecting an item from the dropdown menu
-   Reduce files to folders on commit if all changed files in a folder are selected [#16](https://github.com/UziTech/git-menu/issues/16) [#53](https://github.com/UziTech/git-menu/issues/53)
-   Unstage all files before commit
-   Add Delete Branch command

# [0.16.2](https://github.com/UziTech/git-menu/compare/v0.16.1...v0.16.2) (2017-06-12)

-   Show the last commit message on the Undo Last Commit confirm dialog
-   Show the last commit message on the Add To Last Commit confirm dialog
-   Clean up code with async/await

# [0.16.1](https://github.com/UziTech/git-menu/compare/v0.16.0...v0.16.1) (2017-06-02)

-   Fix remove autocomplete item
-   Fix unknown status not showing correct error
-   Add package-lock.json from npm@5

# [0.16.0](https://github.com/UziTech/git-menu/compare/v0.15.10...v0.16.0) (2017-05-26)

-   Add confirm dialogs to commands that don't have an easy undo [#41](https://github.com/UziTech/git-menu/issues/41)
-   add [promisificator](https://www.npmjs.com/package/promisificator) as a dependency

# [0.15.10](https://github.com/UziTech/git-menu/compare/v0.15.9...v0.15.10) (2017-05-22)

-   Use <kbd>shift</kbd> + <kbd>del</kbd> to remove recent items

# [0.15.9](https://github.com/UziTech/git-menu/compare/v0.15.8...v0.15.9) (2017-05-21)

-   Add Run Command [#43](https://github.com/UziTech/git-menu/issues/43)
-   add [string-argv](https://www.npmjs.com/package/string-argv) as a dependency

# [0.15.8](https://github.com/UziTech/git-menu/compare/v0.15.7...v0.15.8) (2017-04-19)

-   Update to [etch](https://github.com/atom/etch) 0.12.1
-   Fix creating branch with invalid characters

# [0.15.7](https://github.com/UziTech/git-menu/compare/v0.15.6...v0.15.7) (2017-04-08)

-   Fix CSS pollution. Thanks [@danosier](https://github.com/danosier) [#51](https://github.com/UziTech/git-menu/pull/51)

# [0.15.6](https://github.com/UziTech/git-menu/compare/v0.15.5...v0.15.6) (2017-03-28)

-   New Style. Thanks [@MikedeJong](https://github.com/MikedeJong) [#45](https://github.com/UziTech/git-menu/pull/45)
-   Fix commit & push failing if files were removed
-   Add more tests

# [0.15.5](https://github.com/UziTech/git-menu/compare/v0.15.4...v0.15.5) (2017-03-10)

-   Fix Pull sending Push [#46](https://github.com/UziTech/git-menu/issues/46)

# [0.15.4](https://github.com/UziTech/git-menu/compare/v0.15.3...v0.15.4) (2017-03-09)

-   Add --prune flag to fetch calls
-   Dialog buttons will respond to <kbd>enter</kbd> and <kbd>space</kbd> keys when focused

# [0.15.3](https://github.com/UziTech/git-menu/compare/v0.15.2...v0.15.3) (2017-02-27)

-   Fix creating a remote branch [#42](https://github.com/UziTech/git-menu/issues/42)
-   Add Tests 🎉🎊🎇🎆✨

# 0.15.2

-   Fix the way illegal characters are handled in the Create Branch dialog [#39](https://github.com/UziTech/git-menu/issues/39)

# [0.15.1](https://github.com/UziTech/git-menu/compare/v0.15.0...v0.15.1) (2017-02-21)

-   Fix Discard Changes removing untracked files when none were selected [#24](https://github.com/UziTech/git-menu/issues/24)
-   Remove remote branches from the branch list that are also tracked locally

# [0.15.0](https://github.com/UziTech/git-menu/compare/v0.14.2...v0.15.0) (2017-02-15)

-   Initialize will now create a repo in every project folder of a selected file  [#23](https://github.com/UziTech/git-menu/issues/23)
-   Add Fetch command [#36](https://github.com/UziTech/git-menu/issues/36)
-   Add Stash Changes command [#37](https://github.com/UziTech/git-menu/issues/37)
-   Add Unstash Changes command [#38](https://github.com/UziTech/git-menu/issues/38)

# [0.14.2](https://github.com/UziTech/git-menu/compare/v0.14.1...v0.14.2) (2017-02-14)

-   Move dialogs to [etch](https://github.com/atom/etch) [#3](https://github.com/UziTech/git-menu/issues/3)

# [0.14.1](https://github.com/UziTech/git-menu/compare/v0.14.0...v0.14.1) (2017-02-14)

-   Fix @accent-color in css [#35](https://github.com/UziTech/git-menu/issues/35)

# [0.14.0](https://github.com/UziTech/git-menu/compare/v0.13.5...v0.14.0) (2017-02-14)

-   Add Create Branch command [#30](https://github.com/UziTech/git-menu/issues/30)
-   Add Notification settings [#28](https://github.com/UziTech/git-menu/issues/28) [#29](https://github.com/UziTech/git-menu/issues/29)
-   BREAKING CHANGE: The config options `showContextMenuItems` has changed to `contextMenuItems`. You may need to edit your config file manually to convert the settings.

# [0.13.5](https://github.com/UziTech/git-menu/compare/v0.13.4...v0.13.5) (2017-02-10)

-   Allow default keymaps on commands

# [0.13.4](https://github.com/UziTech/git-menu/compare/v0.13.3...v0.13.4) (2017-01-31)

-   Fix Discard All Changes
-   Un/Ignore Changes only works on tracked files
-   More code cleanup

# [0.13.3](https://github.com/UziTech/git-menu/compare/v0.13.2...v0.13.3) (2017-01-31)

-   Clean code
-   Convert coffee script dialogs to javascript [#3](https://github.com/UziTech/git-menu/issues/3)

# [0.13.2](https://github.com/UziTech/git-menu/compare/v0.13.1...v0.13.2) (2017-01-31)

-   Fix Un/Ignore changes only selecting changed files

# [0.13.1](https://github.com/UziTech/git-menu/compare/v0.13.0...v0.13.1) (2017-01-31)

-   Fix error on unsaved untitled tab [#33](https://github.com/UziTech/git-menu/issues/33)

# [0.13.0](https://github.com/UziTech/git-menu/compare/v0.12.2...v0.13.0) (2017-01-31)

-   Add context menu to atom-pane to include .image-view, etc.
-   Add "Ignore Changes" command [#27](https://github.com/UziTech/git-menu/issues/27)
-   Add "Unignore Changes" command
-   Add settings to enable/disable context menu items [#32](https://github.com/UziTech/git-menu/issues/32)

# [0.12.2](https://github.com/UziTech/git-menu/compare/v0.12.1...v0.12.2) (2017-01-30)

-   Add "Fetch" button to the Switch Branch dialog [#31](https://github.com/UziTech/git-menu/issues/31)

# [0.12.1](https://github.com/UziTech/git-menu/compare/v0.12.0...v0.12.1) (2017-01-25)

-   Fix "Discard Changes" pointing to git-menu:discard
-   Fix "Add To Last Commit" pointing to git-menu:amend-last-commit

# [0.12.0](https://github.com/UziTech/git-menu/compare/v0.11.1...v0.12.0) (2017-01-23)

-   Add "Switch Branch" command. Thanks [@sfeldkamp](https://github.com/sfeldkamp) [#25](https://github.com/UziTech/git-menu/issues/25)
-   Use <kbd>Esc</kbd> key to close Commit dialog
-   BREAKING CHANGE: git-menu:discard -> git-menu:discard-changes
-   BREAKING CHANGE: git-menu:amend-last-commit -> git-menu:add-to-last-commit

# [0.11.1](https://github.com/UziTech/git-menu/compare/v0.11.0...v0.11.1) (2017-01-17)

-   update readme
-   change "Amend Last Commit" to "Add To Last Commit"
-   change "Discard" to "Discard Changes"

# [0.11.0](https://github.com/UziTech/git-menu/compare/v0.10.0...v0.11.0) (2017-01-13)

-   Fix commit on editor listing all files
-   Update lowest Atom version to 1.13.0 because of shadow dom removal

# [0.10.0](https://github.com/UziTech/git-menu/compare/v0.9.4...v0.10.0) (2016-12-08)

-   Make git.remove async

# [0.9.4](https://github.com/UziTech/git-menu/compare/v0.9.3...v0.9.4) (2016-12-08)

-   Fix git.remove

# [0.9.3](https://github.com/UziTech/git-menu/compare/v0.9.2...v0.9.3) (2016-12-08)

-   Add "Refresh" command to refresh Atom's git status
-   Fix remove last commit when 0 or 1 commits exist
-   Alert unsaved files on "Commit All"

# [0.9.2](https://github.com/UziTech/git-menu/compare/v0.9.1...v0.9.2) (2016-09-27)

-   Move reset paths to init only

# [0.9.1](https://github.com/UziTech/git-menu/compare/v0.9.0...v0.9.1) (2016-09-21)

-   Fix empty commit message [#22](https://github.com/UziTech/git-menu/issues/22)

# [0.9.0](https://github.com/UziTech/git-menu/compare/v0.8.0...v0.9.0) (2016-09-21)

-   Add "Initialize" command
-   Remove amend option on first commit [#19](https://github.com/UziTech/git-menu/issues/19)

# [0.8.0](https://github.com/UziTech/git-menu/compare/v0.7.0...v0.8.0) (2016-09-21)

-   Add Pull & Push buttons on commit dialog [#15](https://github.com/UziTech/git-menu/issues/15)
-   Add checkboxes to the files list on the commit dialog [#13](https://github.com/UziTech/git-menu/issues/13)

# [0.7.0](https://github.com/UziTech/git-menu/compare/v0.6.0...v0.7.0) (2016-09-20)

-   Add "Amend Last Commit" command

# [0.6.0](https://github.com/UziTech/git-menu/compare/v0.5.1...v0.6.0) (2016-09-20)

-   Add Pull and Push commands
-   Add keywords to package.json
-   Clean up code

# [0.5.1](https://github.com/UziTech/git-menu/compare/v0.5.0...v0.5.1) (2016-08-18)

-   Alert for unsaved files [#18](https://github.com/UziTech/git-menu/issues/18)
-   Clean up code

# [0.5.0](https://github.com/UziTech/git-menu/compare/v0.4.0...v0.5.0) (2016-08-11)

-   Add "Commit All" command
-   Add "Undo Last Commit" command

# [0.4.0](https://github.com/UziTech/git-menu/compare/v0.3.0...v0.4.0) (2016-07-20)

-   Add "Discard" command
-   Set commit message too long at 50 for first line
-   Clean up code

# [0.3.0](https://github.com/UziTech/git-menu/compare/v0.2.3...v0.3.0) (2016-07-06)

-   Add progress bar in status bar
-   Refresh Atom immediately after commit
-   Clean up code

# [0.2.3](https://github.com/UziTech/git-menu/compare/v0.2.2...v0.2.3) (2016-06-15)

-   Add "Push changes" checkbox [#14](https://github.com/UziTech/git-menu/issues/14)
-   Add more git statuses
-   Suppress output from "git add"

# [0.2.2](https://github.com/UziTech/git-menu/compare/v0.2.1...v0.2.2) (2016-05-24)

-   Get full commit message when amend is checked
-   Refresh git status in Atom [#9](https://github.com/UziTech/git-menu/issues/9)
-   Change notifications to not dismissable
-   Clean up code

# [0.2.1](https://github.com/UziTech/git-menu/compare/v0.2.0...v0.2.1) (2016-05-22)

-   Fix multi-line commit messages [#11](https://github.com/UziTech/git-menu/issues/11)

# [0.2.0](https://github.com/UziTech/git-menu/compare/v0.1.4...v0.2.0) (2016-05-21)

-   Add setting for git path [#6](https://github.com/UziTech/git-menu/issues/6)
-   Add notifications [#1](https://github.com/UziTech/git-menu/issues/1)

# [0.1.4](https://github.com/UziTech/git-menu/compare/v0.1.3...v0.1.4) (2016-05-20)

-   Allow multiple files to be selected in treeview [#8](https://github.com/UziTech/git-menu/issues/8)
-   Remove message on uncheck amend

# [0.1.3](https://github.com/UziTech/git-menu/compare/v0.1.2...v0.1.3) (2016-05-20)

-   Move git commands to git-cmd.js [#4](https://github.com/UziTech/git-menu/issues/4)
-   Fix spelling "Ammend" on commit dialog
-   Change screenshot

# [0.1.2](https://github.com/UziTech/git-menu/compare/v0.1.1...v0.1.2) (2016-05-19)

-   Add changes to CHANGELOG.md

# [0.1.1](https://github.com/UziTech/git-menu/compare/v0.1.0...v0.1.1) (2016-05-19)

-   Add screenshot to README.md

# 0.1.0 (2016-05-19)

-   Initial Release
