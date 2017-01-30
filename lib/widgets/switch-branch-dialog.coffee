# coffeelint: disable=max_line_length

{$, View} = require 'atom-space-pen-views'
git = require "../git-cmd"

module.exports =
class Dialog extends View
  @content: ->
    @div class: 'dialog context-git', keyup: 'keyup', =>
      @div class: 'heading', =>
        @i class: 'icon x clickable', click: 'cancel'
        @strong 'Switch Branch'
      @div class: 'body', =>
        @label 'Select A Branch'
        @select class: 'branches native-key-bindings', outlet: 'branches'
      @div class: 'buttons', =>
        @button class: 'active', click: 'switch', outlet: 'switchButton', =>
          @i class: 'icon branch'
          @span 'Switch Branch'
        @button click: 'fetch', =>
          @i class: 'icon sync'
          @span 'Fetch'
        @button click: 'cancel', =>
          @i class: 'icon x'
          @span 'Cancel'

  activate: (branches, @root) ->
    @listBranches branches
    @show()
    @branches.focus()
    return new Promise (resolve, reject) =>
      @resolve = resolve
      @reject = reject
      return

  listBranches: (branches) ->
    @branches.html(branches.map( (branch) ->
      $option = $("<option />").attr({value: branch.name}).text(branch.path)
      $option.attr('selected','selected') if branch.selected
      return $option
    ))
    return

  deactivate: ->
    @modalPanel.destroy()
    @detach()
    return

  keyup: (event, dialog) ->
    @cancel() if event.keyCode == 27
    @switch() if event.keyCode == 13
    return

  cancel: ->
    @reject()
    @deactivate()
    return

  show: ->
    @modalPanel = atom.workspace.addModalPanel(item: @, visible: true)

  switch: () ->
    branch = @branches.val()
    # return unless branch != ""
    @resolve branch
    @deactivate()
    return

  fetch: () ->
    @listBranches([{name: "", path: "Fetching...", selected: true}])
    @branches.prop({disabled: true})
    @switchButton.prop({disabled: true})
    git.fetch(@root)
      .then(() => git.branches(@root))
      .then((branches) =>
        @listBranches(branches)
        @branches.prop({disabled: false})
        @switchButton.prop({disabled: false})
      )
    return
