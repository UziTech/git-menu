{$, View} = require 'atom-space-pen-views'

module.exports =
class CommitDialog extends View
  @content: ->
    @div class: 'dialog context-git', =>
      @div class: 'heading', =>
        @i class: 'icon x clickable', click: 'cancel'
        @strong 'Commit'
      @div class: 'body', =>
        @label 'Files'
        @div class: 'files', outlet: 'files'
        @label 'Message'
        @textarea class: 'native-key-bindings', outlet: 'message', keyUp: 'colorLength'
        @label =>
          @text 'Amend last commit?'
          @input type: 'checkbox', class: 'checkbox amend', outlet: 'amend', change: 'amendChange'
      @div class: 'buttons', =>
        @button class: 'active', click: 'commit', =>
          @i class: 'icon commit'
          @span 'Commit'
        @button click: 'cancel', =>
          @i class: 'icon x'
          @span 'Cancel'

  activate: (files, lastCommit, commitCallback) ->
    @files.files = files.map (file) -> file.file
    @files.html(files.map( (file) ->
      $file = $("<div />").addClass("file").text(file.file)

      $file.addClass "added" if file.added
      $file.addClass "untracked" if file.untracked
      $file.addClass "deleted" if file.deleted
      $file.addClass "changed" if file.changed

      return $file
    ))
    @lastCommit = lastCommit
    @amend.prop({checked: false})
    @message.val('')
    @commitCallback = commitCallback
    @show()
    @message.focus()
    return

  deactivate: ->
    @modalPanel.destroy()
    @detach()
    return

  cancel: ->
    @deactivate()
    return

  colorLength: ->
    lines = @message.val().split("\n")
    too_long = lines.some (line) ->
      return (lines.length is 1 and line.length > 50) or (line.length > 80)

    if too_long
      @message.addClass('over-fifty')
    else
      @message.removeClass('over-fifty')
    return

  amendChange: ->
    if @amend.prop("checked") and @message.val() is ''
      @message.val(@lastCommit)
    return

  show: ->
    @modalPanel = atom.workspace.addModalPanel(item: @, visible: true)

  commit: ->
    @commitCallback @message.val(), @amend.prop("checked"), @files.files
    @deactivate()
    return
