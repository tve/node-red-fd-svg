# Node-RED FlexDash SVG

## FlexDash HTML widget

This node & widget displays raw HTML in FlexDash and allows a Node-RED flow to alter the
HTML via messages.

Messages may have the following fields:

- `html` - a string containing HTML to replace the entire contents of the widget
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

### Command list

- `id` - set the ID of the element to `args[0]`
- `class` - set the class of the element to `args[0]`
- `attr` - merge the attributes in `args` (an object) into the element
- `text` - set the "inner text" of the selected elements to `args[0]`
- `html` - set the "inner HTML" of the selected elements to `args[0]`, i.e., parse the HTML and
  set the resulting elements as children of the selected elements
