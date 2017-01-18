# coffeelint: disable=max_line_length

# TODO: map key down to open the select list
# TODO: map enter to checkout
# TODO: map esc to cancel
# TODO: noop if branch selected is current branch
# TODO: select current branch

{$, View} = require 'atom-space-pen-views'

module.exports =
class CommitDialog extends View
  @content: ->
    @div class: 'dialog context-git', =>
      @div class: 'heading', =>
        @i class: 'icon x clickable', click: 'cancel'
        @strong 'Checkout'
      @div class: 'body', =>
        @label 'Branches'
        @select class: 'branches', outlet: 'branches'
      @div class: 'buttons', =>
        @button class: 'active', click: 'checkout', =>
          @i class: 'icon desktop-download'
          @span 'Checkout'
        @button click: 'cancel', =>
          @i class: 'icon x'
          @span 'Cancel'

  activate: (branches) ->
    @branches.html(branches.map( (branch) ->
      $option = $("<option />").attr({value: branch.name}).text(branch.path)
      if branch.charAt(0) == '*'
        $option.attr('selected','selected')
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

  cancel: ->
    @reject()
    @deactivate()
    return

  show: ->
    @modalPanel = atom.workspace.addModalPanel(item: @, visible: true)

  checkout: () ->
    @resolve [
      @branches.val()
    ]
    @deactivate()
    return
