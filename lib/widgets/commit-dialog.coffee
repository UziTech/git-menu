# coffeelint: disable=max_line_length

{$, View} = require 'atom-space-pen-views'

module.exports =
class Dialog extends View
  @content: ->
    @div class: 'dialog context-git', keyup: 'keyup', =>
      @div class: 'heading', =>
        @i class: 'icon x clickable', click: 'cancel'
        @strong 'Commit'
      @div class: 'body', =>
        @label 'Files'
        @div class: 'files', outlet: 'files'
        @label 'Message'
        @textarea class: 'message native-key-bindings', outlet: 'message', keyUp: 'messageKeyUp'
        @label =>
          @text 'Amend last commit'
          @input type: 'checkbox', class: 'checkbox amend', outlet: 'amend', change: 'amendChange'
      @div class: 'buttons', =>
        @button class: 'active', click: 'commit', =>
          @i class: 'icon commit'
          @span 'Commit'
        @button click: 'commitPush', =>
          @i class: 'icon push'
          @span 'Commit & Push'
        @button click: 'commitPullPush', =>
          @i class: 'icon pull'
          @span 'Commit & Pull & Push'
        @button click: 'cancel', =>
          @i class: 'icon x'
          @span 'Cancel'

  activate: (files, lastCommit) ->
    @files.html(files.map( (file) ->
      $checkbox = $("<input />").attr({ type: "checkbox" }).prop({ checked: true })
      $span = $("<span />").text(file.file)
      $label = $("<label />").append($checkbox, $span)
      $file = $("<div />").addClass("file").append($label)

      $file.addClass "added" if file.added
      $file.addClass "untracked" if file.untracked
      $file.addClass "deleted" if file.deleted
      $file.addClass "changed" if file.changed

      return $file
    ))
    @lastCommit = lastCommit
    @amend.prop({checked: false})
    if lastCommit is null
      @amend.prop({disabled: true})
    @message.val('')
    @show()
    @message.focus()
    return new Promise (resolve, reject) =>
      @resolve = resolve
      @reject = reject
      return

  deactivate: ->
    @modalPanel.destroy()
    @detach()
    return

  keyup: (event, dialog) ->
    @cancel() if event.keyCode == 27
    return

  getFiles: ->
    $.makeArray(@files.find(".file").filter((i, el) -> $(el).find("input").prop("checked")).map((i, el) -> $(el).find("label").text()))

  cancel: ->
    @reject()
    @deactivate()
    return

  messageKeyUp: ->
    message = @message.val()
    lines = message.split("\n")

    error = message is ""
    tooLong = lines.some (line, idx) -> (idx is 1 and line.length > 50) or (line.length > 80)

    @message.toggleClass("error", error)
    @message.toggleClass("too-long", tooLong)
    return

  amendChange: ->
    if @amend.prop("checked")
      if @message.val() is ''
        @message.val(@lastCommit)
        @messageKeyUp
    else
      if @message.val() is @lastCommit
        @message.val('')
        @messageKeyUp
    return

  show: ->
    @modalPanel = atom.workspace.addModalPanel(item: @, visible: true)

  doCommit: (push, pull) ->
    message = @message.val()
    if message is ""
      @message.addClass("error").focus()
      return
    @resolve [
      @message.val(),
      @amend.prop("checked"),
      push,
      pull,
      @getFiles()
    ]
    @deactivate()
    return

  commit: ->
    @doCommit(false, false)
    return

  commitPush: ->
    @doCommit(true, false)
    return

  commitPullPush: ->
    @doCommit(true, true)
    return
