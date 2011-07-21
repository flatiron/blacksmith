The error object is a built-in object that captures the stack trace and a message. For example:

Code:
    var error = new Error("The error message");
    console.log(error);
    console.log(error.stack);

Result:
    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'The error message' }
    Error: The error message
        at Object.<anonymous> (/home/nico/example.js:1:75)
        at Module._compile (module.js:407:26)
        at Object..js (module.js:413:10)
        at Module.load (module.js:339:31)
        at Function._load (module.js:298:12)
        at Array.0 (module.js:426:10)
        at EventEmitter._tickCallback (node.js:126:26)

As you can see, `error.stack` contains all the information you need to track down a bug. It gives you the trace as well as the description. Note that if you want to add more information to the Error object that you can always add properities. 

    var error = new Error("The error message");
    error.http_code = 404;
    console.log(error);

For more details how to use the Error object, check out the <article on error conventions>.
