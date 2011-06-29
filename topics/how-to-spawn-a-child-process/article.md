#How to spawn a child process - the basics

If you find yourself wishing you could have your Node.js process start another program for you, then look no further than the `child_process` module.  

The simplest way is the "fire, forget, and buffer" method using `child_process.exec`.  It runs your process, buffers its output (up to a default maximum of 200kb), and lets you access it from a callback when it's finished.  Let's take a look at an example:

     var childProcess = require('child_process'),
         ls;
     
     ls = childProcess.exec('ls -l', function (error, stdout, stderr) {
       if (error) { 
         console.log(error.stack); 
         console.log('Error code: '+error.code);
         console.log('Signal received: '+error.signal);
       }
       console.log('Child Process STDOUT: '+stdout);
       console.log('Child Process STDERR: '+stderr);
     });
     
     ls.on('exit', function (code) {
       console.log('Child process exited with exit code '+code);
     });
     
NODE PRO TIP: `error.stack` shows you a stack trace to the point at which the current Error object was created.  

It should be noted that a given process' `STDERR` is not exclusively reserved for error messages: many programs use it as a channel for secondary data instead.  As such, when trying to work with a program that you haven't spawned as a child process before, it can be helpful to start out dumping both `STDOUT` and `STDERR`, as pictured above, so as to avoid any surprises.  

While `child_process.exec` buffers the child process' outputs for you, it also returns a `ChildProcess` object, Node's way of wrapping a still-running process.  In the example above, since we're using `ls`, a program that will exit immediately regardless, the only part of the `ChildProcess` object worth worrying about is the `on exit` handler.   It isn't necessary here - the process will still exit and the error code will still be shown on errors.  


