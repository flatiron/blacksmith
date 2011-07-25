# How to use util.inspect

Node provides a utility function, for debugging purposes, that returns a string representation of an object (a la JSON).  Knowledge of this method - `util.inspect()` - can be a true lifesaver while working with properties of large, complex objects. 

Let's provide a basic example.  `util.inspect()` can be used on any object - a good demonstration will be one of Node's built-in objects.  Try this in the REPL (type `node` at your command line with no arguments):

     var util = require('util')
     util.inspect(console)
     
The output will be:

     '{ log: [Function], info: [Function], warn: [Function], error: [Function], dir: [Function], time: [Function], timeEnd: [Function], trace: [Function], assert: [Function] }'
     
This is a listing of all the enumerable properties of the `console` object.  It is also worth noting that `console.dir` is a wrapper around `util.inspect` that uses its default arguments.

In the REPL, `util.inspect` will immediately return its output - this is not usually the case.  In the context of normal Node.js code in a file, something must be done with the output.  The simplest thing to do:

     console.log(util.inspect(myObj));

`util.inspect` can also be passed optional arguments - the full syntax is listed in the main documentation as:

     util.inspect(showHidden=false, depth=2, object)

But this is misleading, as the first argument is the argument that gets inspected.  The actual syntax is as follows:

     util.inspect(myObj, true, 7)

This would inspect `myObj`, showing all the hidden and non-hidden properties up to a depth of `7`.

The `depth` argument is the number of levels deep into a nested object to recurse - it defaults to 2.  Setting it to `null` will cause it to recurse 'all the way', showing every level.  Compare the (size of) the outputs of these two `util.inspect` statements in the REPL:

     var http = require('http')
     util.inspect(http, true, 1)
     util.inspect(http, true, 3)

The other optional argument, `showHidden`, is a boolean that determines whether or not the 'non-enumerable' properties of an object will be displayed - it defaults to `false`, which tends to result in vastly more readable output.  This isn't something a beginner needs to worry about most of the time, but it's worth demonstrating briefly.  Once more, try the following in the REPL:

     var util = require('util')
     util.inspect(console, true)

This should produce significantly more output than `util.inspect(console)`.  This can be useful for debugging, but don't worry about it too deeply - it's more of an advanced topic.