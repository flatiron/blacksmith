Most web servers, in addition to responding to http requests, also write logs in one form or another. Reasons for logging include debugging and reporting application state.

## Logging the Obvious Way

You likely log data already, using `console.log`. In this approach, any information is printed to stdout where it can either be read directly or, for example, piped to a file. Plus, it's really easy:

    console.log("Hello world!");

Because it's so simple, console.log is by far the most common way of logging data in node.js.

## Custom Logging

An advanced technique involves writing your own logging function or method, and delegating all logging to it. For example, here's a minimal log function:

    exports.log = function(level, message) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        };
        console.log(level+": "+message);
    }

which can then be used like so:

    > var logger = require("./logger");
    > logger.log("info", { error: "flagrant"})
    info: {"error":"flagrant"}

The advantage is that the behavior of our logging mechanisms can now be modified and controlled from a central part of your code. In this case, I added logging levels (such as "debug", "info" and "warning"), and messages are converted to JSON if they aren't already in string form. This also makes it really easy to add features like file-based logging, special text formats, or even pushing logs to a database!

## Production-Grade Logging with Winston

[Winston](https://github.com/indexzero/winston) is a production-grade, multi-transport, asynchronous logging library for node.js. Conceptually it is similar to our custom logger but comes with a bunch of great features and functionality baked in. In addition, winston is battle-hardened by internal use at Nodejitsu!

Here is an example of a configured winston logger:

    var winston = require("winston");
    winston.add(winston.transports.File, { filename: 'somefile.log' });

Here, we required winston, and then added a file transport so that logs get written to a flat file. Winston also has built-in support for configurable logging levels *and* aliases for the "log" so you don't have to type the logging level each time.

For example, `warn(x)` is an alias for `log("warn", x)`. Using it from the REPL looks like this:

    > winston.warn("Hull breach on deck 7!")
    warn: Hull breach on deck 7!

Winston then happily printed the logged message to the screen. However, because of the added file transport winston *also* logged the warning to "somefile.log"!

    $ cat somefile.log 
    {"level":"warn","message":"Hull breach on deck 7!"}

Awesome! Note that winston's file logger formats the logs differently for file logging (JSON in this case) than it does for the console transport.

Winston also supports logging to Riak, MongoDB and even [Loggly](http://loggly.com). Winston is also [thoroughly documented](https://github.com/indexzero/winston).
