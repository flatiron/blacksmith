Node allows users to create their own REPLs with the [repl module](http://nodejs.org/docs/v0.4.10/api/repl.html). Its basic use looks like this:

    repl.start(prompt, stream);

`prompt` is a string that's used for the prompt of your REPL and defaults to "> ". `stream` is the stream that the repl listens on and defaults to `process.stdin`. When you run `node` from the command prompt, what it's doing in the background is running `repl.start()` to give you the standard REPL.

However, the repl is pretty flexible. Here's an example that shows this off:

    #!/usr/bin/env node

    var net = require("net"),
        repl = require("repl");

    // Just a globally-defined function that returns a random emoticon...
    mood = function () {
        var m = [ "^__^", "-___-;", ">.<", "<_>" ];
        return m[Math.floor(Math.random()*m.length)];
    };


    //A remote node repl that you can telnet to!
    net.createServer(function (socket) {
      repl.start("node::remote> ", socket);
    }).listen(5001);

    console.log("Remote REPL started on port 5001.");

    //A "local" node repl with a custom prompt
    repl.start("node::local> ");

This script defines a global variable (in this case a function), then creates
*two* REPLs: One is normal excepting for its custom prompt, but the *other* is
exposed via the net module so I can telnet to it!

Here's what happens when I run the script:

    $ node repl.js 
    Remote REPL started on port 5001.
    node::local> mood()
    '<_>'
    node::local> 

Notice that I was able to access the `mood` function. This is because *all globally-defined functions are accessible from all REPLs.*

Now, here's what happens when I try to telnet to port 5001:

    $ telnet localhost 5001
    Trying ::1...
    Trying 127.0.0.1...
    Connected to localhost.
    Escape character is '^]'.
    node::remote> mood()
    '^__^'
    node::remote> 

As you can see, the `mood` function is *also* available over telnet!

I can also edit these variables over telnet too:

    node::remote> mood = function () {
    ...     var m = [ ":D", ":|", ">:C", "D:" ];
    ...     return m[Math.floor(Math.random()*m.length)];
    ... };
    [Function]
    node::remote> 

This is reflected by the local prompt:

    node::local> mood()
    ':D'
    node::local> 

As you can see, the node REPL is powerful and flexible.
