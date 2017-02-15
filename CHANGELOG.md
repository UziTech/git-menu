<!-- lint disable first-heading-level list-item-indent -->

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

- Add "Switch Branch" command. Thanks @sfeldkamp [#25](https://github.com/UziTech/context-git/issues/25)
- Use [Esc] key to close Commit dialog
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
