# coffeelint: disable=max_line_length

# TODO: fix arrow down and up don't select options in focused branches select

{$, View} = require 'atom-space-pen-views'

module.exports =
class CommitDialog extends View
  @content: ->
    @div class: 'dialog context-git', keyup: 'keyup', =>
      @div class: 'heading', =>
        @i class: 'icon x clickable', click: 'cancel'
        @strong 'Switch'
      @div class: 'body', =>
        @label 'Select A Branch'
        @select class: 'branches', outlet: 'branches'
      @div class: 'buttons', =>
        @button class: 'active', click: 'switch', =>
          @i class: 'icon branch'
          @span 'Switch'
        @button click: 'cancel', =>
          @i class: 'icon x'
          @span 'Cancel'

  activate: (branches) ->
    @branches.html(branches.map( (branch) ->
      $option = $("<option />").attr({value: branch.name}).text(branch.path)
      $option.attr('selected','selected') if branch.selected
      return $option
    ))
    @show()
    @branches.focus()
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
    @switch() if event.keyCode == 13
    @openBranches() if event.keyCode == 40 || event.keyCode == 38
    return

  cancel: ->
    @reject()
    @deactivate()
    return

  show: ->
    @modalPanel = atom.workspace.addModalPanel(item: @, visible: true)

  switch: () ->
    @resolve [
      @branches.val()
    ]
    @deactivate()
    return

  openBranches: () ->
    console.log('openBranches', arguments)
    @branches.trigger('change')
