<!-- lint disable first-heading-level list-item-indent -->

## 1.0.0 Git Menu

- Change package name to git-menu.
- Changed default notification setting to show git output.

## 0.20.0 Backwards Compatible

- Use Synchronous Confirmation Dialogs in Atom <=1.24.x

## 0.19.0 Add Log and Stage commands

- add [Commit Staged](https://github.com/UziTech/context-git/blob/master/docs/docs.md#commit-staged) command
- add [Stage Changes](https://github.com/UziTech/context-git/blob/master/docs/docs.md#stage-changes) command
- Unstage files before Add to Last Commit
- Add [Log](https://github.com/UziTech/context-git/blob/master/docs/docs.md#log) command

## 0.18.2 Fix Async Dialog Accept

- Fix Async Dialog

## 0.18.1 Fix Branches

- Fix Create/Switch/Delete Branch

## 0.18.0 Async Dialogs

- Async Confirmation Dialogs (only works in Atom >=1.25.0)

## 0.17.7 Work with github

- Now works with the github package

## 0.17.6 Fix Create Branch upstream notification

- Fix notification not showing after creating an upstream branch

## 0.17.5 Include results of multiple git calls

- Include the results of multiple git calls when notification setting is set to show git output.
- Warn about incompatibility with the `github` package [atom/github#961](https://github.com/atom/github/issues/961#issuecomment-317040677)

## 0.17.4 Remove untracked directories

- Remove untracked directories on Discard Changes
- Show the command as the notification title

## 0.17.3 Git everywhere

- Git is now available in every context menu
- Unstage files before Discard Changes
- Fix reduce files when no files change

## 0.17.2 Same as v0.17.1

- apm failed

## 0.17.1 Reduce paths on Discard Changes

- Reduce files to folders on discard-changes if all changed files in a folder are selected [#16](https://github.com/UziTech/context-git/issues/16) [#53](https://github.com/UziTech/context-git/issues/53)
- Shorten progress bar on status bar
- Add command to git notifications
- Add progress bar to branch operations
- Change Pull & Push to Sync

## 0.17.0 Unstage all files before commit

- If `index.lock` exists ask to remove it before running a command [#59](https://github.com/UziTech/context-git/issues/59)
- Dispatched commands now return a promise with hopes that [atom/atom#14931](https://github.com/atom/atom/pull/14931) will be merged
- Fix Run Command when selecting an item from the dropdown menu
- Reduce files to folders on commit if all changed files in a folder are selected [#16](https://github.com/UziTech/context-git/issues/16) [#53](https://github.com/UziTech/context-git/issues/53)
- Unstage all files before commit
- Add Delete Branch command

## 0.16.2 - Show last commit on confirm dialogs

- Show the last commit message on the Undo Last Commit confirm dialog
- Show the last commit message on the Add To Last Commit confirm dialog
- Clean up code with async/await

## 0.16.1 - Fix remove autocomplete item

- Fix remove autocomplete item
- Fix unknown status not showing correct error
- Add package-lock.json from npm@5

## 0.16.0 - Add confirm dialogs

- Add confirm dialogs to commands that don't have an easy undo [#41](https://github.com/UziTech/context-git/issues/41)
- add [promisificator](https://www.npmjs.com/package/promisificator) as a dependency

## 0.15.10 - Use <kbd>shift</kbd> + <kbd>del</kbd> to remove recent items

- Use <kbd>shift</kbd> + <kbd>del</kbd> to remove recent items

## 0.15.9 - Add Run Command

- Add Run Command [#43](https://github.com/UziTech/context-git/issues/43)
- add [string-argv](https://www.npmjs.com/package/string-argv) as a dependency

## 0.15.8 - Fix Create Branch

- Update to [etch](https://github.com/atom/etch) 0.12.1
- Fix creating branch with invalid characters

## 0.15.7 - Fix CSS pollution

- Fix CSS pollution. Thanks [@danosier](https://github.com/danosier) [#51](https://github.com/UziTech/context-git/pull/51)

## 0.15.6 - New Style

- New Style. Thanks [@MikedeJong](https://github.com/MikedeJong) [#45](https://github.com/UziTech/context-git/pull/45)
- Fix commit & push failing if files were removed
- Add more tests

## 0.15.5 - Fix Pull

- Fix Pull sending Push [#46](https://github.com/UziTech/context-git/issues/46)

## 0.15.4 - Click dialog button with keys when focused

- Add --prune flag to fetch calls
- Dialog buttons will respond to <kbd>enter</kbd> and <kbd>space</kbd> keys when focused

## 0.15.3 - Fix Create Branch with Tracking

- Fix creating a remote branch [#42](https://github.com/UziTech/context-git/issues/42)
- Add Tests 🎉🎊🎇🎆✨

## 0.15.2 - Fix illegal characters in branch name

- Fix the way illegal characters are handled in the Create Branch dialog [#39](https://github.com/UziTech/context-git/issues/39)

## 0.15.1 - Fix Discard Changes

- Fix Discard Changes removing untracked files when none were selected [#24](https://github.com/UziTech/context-git/issues/24)
- Remove remote branches from the branch list that are also tracked locally

## 0.15.0 - Fix initialize with multiple project folders

- Initialize will now create a repo in every project folder of a selected file  [#23](https://github.com/UziTech/context-git/issues/23)
- Add Fetch command [#36](https://github.com/UziTech/context-git/issues/36)
- Add Stash Changes command [#37](https://github.com/UziTech/context-git/issues/37)
- Add Unstash Changes command [#38](https://github.com/UziTech/context-git/issues/38)

## 0.14.2 - More keyboard friendly dialogs

- Move dialogs to [etch](https://github.com/atom/etch) [#3](https://github.com/UziTech/context-git/issues/3)

## 0.14.1 - Fix css @accent-color

- Fix @accent-color in css [#35](https://github.com/UziTech/context-git/issues/35)

## 0.14.0 - Add Notifications settings

- Add Create Branch command [#30](https://github.com/UziTech/context-git/issues/30)
- Add Notification settings [#28](https://github.com/UziTech/context-git/issues/28) [#29](https://github.com/UziTech/context-git/issues/29)
- BREAKING CHANGE: The config options `showContextMenuItems` has changed to `contextMenuItems`. You may need to edit your config file manually to convert the settings.

## 0.13.5 - Allow default keymaps on commands

- Allow default keymaps on commands

## 0.13.4 - Fix Discard All Changes

- Fix Discard All Changes
- Un/Ignore Changes only works on tracked files
- More code cleanup

## 0.13.3 - Clean code

- Clean code
- Convert coffee script dialogs to javascript [#3](https://github.com/UziTech/context-git/issues/3)

## 0.13.2 - Fix Ignore Changes

- Fix Un/Ignore changes only selecting changed files

## 0.13.1 - Fix error on unsaved untitled tab

- Fix error on unsaved untitled tab [#33](https://github.com/UziTech/context-git/issues/33)

## 0.13.0 - Add settings to enable/disable context menu items

- Add context menu to atom-pane to include .image-view, etc.
- Add "Ignore Changes" command [#27](https://github.com/UziTech/context-git/issues/27)
- Add "Unignore Changes" command
- Add settings to enable/disable context menu items [#32](https://github.com/UziTech/context-git/issues/32)

## 0.12.2 - Add Fetch button in Switch Branch dialog

- Add "Fetch" button to the Switch Branch dialog [#31](https://github.com/UziTech/context-git/issues/31)

## 0.12.1 - Fix context menu commands

- Fix "Discard Changes" pointing to context-git:discard
- Fix "Add To Last Commit" pointing to context-git:amend-last-commit

## 0.12.0 - Add "Switch Branch" command

- Add "Switch Branch" command. Thanks [@sfeldkamp](https://github.com/sfeldkamp) [#25](https://github.com/UziTech/context-git/issues/25)
- Use <kbd>Esc</kbd> key to close Commit dialog
- BREAKING CHANGE: context-git:discard -> context-git:discard-changes
- BREAKING CHANGE: context-git:amend-last-commit -> context-git:add-to-last-commit

## 0.11.1 - update readme

- update readme
- change "Amend Last Commit" to "Add To Last Commit"
- change "Discard" to "Discard Changes"

## 0.11.0 - Fix commit on editor

- Fix commit on editor listing all files
- Update lowest Atom version to 1.13.0 because of shadow dom removal

## 0.10.0 - Make git.remove async

- Make git.remove async

## 0.9.4 - Fix git remove

- Fix git.remove

## 0.9.3 - Add "Refresh" command

- Add "Refresh" command to refresh Atom's git status
- Fix remove last commit when 0 or 1 commits exist
- Alert unsaved files on "Commit All"

## 0.9.2 - Fix always resetting paths on refresh

- Move reset paths to init only

## 0.9.1 - Fix empty commit message

- Fix empty commit message [#22](https://github.com/UziTech/context-git/issues/22)

## 0.9.0 - Add "Initialize" command

- Add "Initialize" command
- Remove amend option on first commit [#19](https://github.com/UziTech/context-git/issues/19)

## 0.8.0 - Add checkboxes & pull before push

- Add Pull & Push buttons on commit dialog [#15](https://github.com/UziTech/context-git/issues/15)
- Add checkboxes to the files list on the commit dialog [#13](https://github.com/UziTech/context-git/issues/13)

## 0.7.0 - Add "Amend Last Commit" command

- Add "Amend Last Commit" command

## 0.6.0 - Add Pull and Push commands

- Add Pull and Push commands
- Add keywords to package.json
- Clean up code

## 0.5.1 - Alert for unsaved files

- Alert for unsaved files [#18](https://github.com/UziTech/context-git/issues/18)
- Clean up code

## 0.5.0 - Add "Undo Last Commit", "Commit All" commands

- Add "Commit All" command
- Add "Undo Last Commit" command

## 0.4.0 - Add "Discard" command

- Add "Discard" command
- Set commit message too long at 50 for first line
- Clean up code

## 0.3.0 - Add progress bar in status bar

- Add progress bar in status bar
- Refresh Atom immediately after commit
- Clean up code

## 0.2.3 - Add "Push changes" checkbox

- Add "Push changes" checkbox [#14](https://github.com/UziTech/context-git/issues/14)
- Add more git statuses
- Suppress output from "git add"

## 0.2.2 - Refresh git status in Atom

- Get full commit message when amend is checked
- Refresh git status in Atom [#9](https://github.com/UziTech/context-git/issues/9)
- Change notifications to not dismissable
- Clean up code

## 0.2.1 - Fix multi-line commit messages

- Fix multi-line commit messages [#11](https://github.com/UziTech/context-git/issues/11)

## 0.2.0 - Add config var for git path

- Add setting for git path [#6](https://github.com/UziTech/context-git/issues/6)
- Add notifications [#1](https://github.com/UziTech/context-git/issues/1)

## 0.1.4 - Select multiple files in treeview

- Allow multiple files to be selected in treeview [#8](https://github.com/UziTech/context-git/issues/8)
- Remove message on uncheck amend

## 0.1.3 - Move git commands to new file

- Move git commands to git-cmd.js [#4](https://github.com/UziTech/context-git/issues/4)
- Fix spelling "Ammend" on commit dialog
- Change screenshot

## 0.1.2 - Add CHANGELOG.md

- Add changes to CHANGELOG.md

## 0.1.1 - Add screenshot

- Add screenshot to README.md

## 0.1.0 - First Release

- Initial Release
