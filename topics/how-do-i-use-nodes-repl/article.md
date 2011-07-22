# How to use the Node.js REPL


Node.js ships with a REPL, which is short for 'Read-Eval-Print Loop'.  It is the Node.js shell. You can type javascript in line by line and test out your code. Any valid javascript which can be written in a script can be passed to the REPL. It can be useful for experimenting with node.js and figuring out some of javascript's eccentric behaviors.

Running it is simple:
`node`

It then drops you into a simple prompt where you can type your command. As in most shells, you can press up to modify previous commands. Also, you can press `Tab` to make the REPL try to autocomplete the command.

Whenever you type a command, it will print the return value of the command. If you want to reuse the previous return value, you can use the special `_` variable.

For example:

    node
    > 1+1
    2
    > _+1
    3

If you need to access any of the builtin or third party modules, they can be accessed with `require` as usual.

For example:

  node
  > path = require('path')
  { resolve: [Function],
    normalize: [Function],
    join: [Function],
    dirname: [Function],
    basename: [Function],
    extname: [Function],
    exists: [Function],
    existsSync: [Function] }
  > path.basename("/a/b/c.txt")
  'c.txt'

