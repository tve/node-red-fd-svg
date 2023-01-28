# Node-RED FlexDash SVG

## FlexDash HTML widget

This node & widget displays raw HTML in FlexDash and allows a Node-RED flow to alter the
HTML via messages.

Messages may have the following fields:

- `payload` - a string containing HTML to replace the entire contents of the widget
- `selector` - a CSS selector to select elements to operate on
- `command` - a string containing a command to execute on the selected elements, see below
- `args` - an array of arguments to pass to the command
- `commands` - an array of commands to execute, each element must contain a `command` an
  `args` field and optionally a `selector` field (the latter defaults to the HTML root!)

The fields are processed in the following order: first `html`, then `selector`, `command`
and `args`, then `commands`.

### Selectors

Standard selectors for ID (`#id`), class (`.class`) and attribute (`[attr]` or `[attr=value]`)
are supported. The ` ` (space) combinator is supported, other combinators are not.

When an array of commands is specified, the `selector` field may have the value `.` to refer to
the same elements as the previous command in the same message.

### HTML elements in arguments

Some commands, such as `append` and `prepend`, take HTML elements as arguments.
These must be Javascript objects with fields `tag` (the tag name), `attrs` (the
attributes including `id` and `class` if desired) and optionally `children` (an array of child
elements) or `text` (the text content of the element).
Elements with `text` must have a tag of `span` and no children.

### Command list

The commands are loosely patterned after JQuery.

**Commands that return something should output a message but currently don't**

- `id` - set the ID of the element to `args[0]`
- `addClass` - add `args[...]` to the classes of the element
- `hasClass` - check whether any of the elements has class `args[0]`, returns a boolean
- `removeClass` - remove `args[...]` from the classes of the element
- `attr` - if `args.length==1` return an array with the values of the attribute `args[0]` for
  each selected element, if `args.length==2` set the attribute `args[0]` to the value `args[1]`
  for each element
- `hasAttr` - check whether any of the elements has attribute `args[0]`, returns a boolean
  (doesn't exist in JQuery)
- `text` - if `args.length==0` get the "inner text" of the selected elements (concatenated),
  else set the "inner text" of the selected elements to `args[0]` creating span elements,
  which is equivalent to bare text in HTML
  (currently there is no escaping done of `<`, but that will be added...)
- `html` - set the "inner HTML" of the selected elements to `args[0]`, i.e., parse the HTML and
  set the resulting elements as children of the selected elements
- `append` - append elements `args[0...]` to each of the selected elements
- `prepend` - prepend elements `args[0...]` to each of the selected elements
- `empty` - remove all children of the selected elements
- `remove` - remove the selected elements
- `replaceWith` - replace the selected elements with elements `args[0...]`
