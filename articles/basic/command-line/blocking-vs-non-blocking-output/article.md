# Blocking vs. non-blocking output

In Node.js, there are a number of different built-in methods available that will all ultimately result in output reaching the console.  Under the hood, all of these different methods do one of two things: they either make non-blocking writes to `stdout`, or they make blocking writes to `stderr`.

A given operating system can only write out so much at a time - when there's a lot to write, it gets added to a write buffer, and the OS keeps taking as much as it can handle out of the buffer, chunk by chunk, until there's nothing else to write.  Once the OS is crunching away on your output, there are only two things for a program to do: block and wait, or move on and let the OS do its thing.

The first way - blocking and waiting - is what the `stderr` methods do in Node.js.  There's a function called `writeError` in Node core that does exactly this - if the output is buffered, it sleeps for 100 microseconds and tries to write again, until the write buffer is completed.  The rest of your code does not execute while this is going on.

When dealing with errors, this can make sense - you want the message when it happens, as opposed to when the OS gets around to showing it to you.

In Node, `console.warn`, `console.error`, and `util.debug` all call `writeError` under the hood.

The other way to do things is the non-blocking way - instead of waiting for the OS, you just keep adding to the write buffer, and your Node process is free to take care of other things - like the rest of your code.

In Node, `console.log`, `console.info`, `util.print`, and `util.puts` all write to `stdout` without blocking.

Be careful, though - non-blocking output can lead to some extremely maddening bugs if you're not careful.  You have no guarantee of the output completing at a specific time - it's a race condition you'll usually win, but a race condition nonetheless.

The `process.exit()` method is the easiest way to illustrate this, as it causes the process to exit immediately without regard for the state of the output buffer.  Let's look at an example. 

      for (var i = 100; i < 20000; i++) {
        console.log(i.toString());
        if (i == 19990) {
          process.exit();
        }
      }

If you see every number up to 19990, try making the numbers even larger and try again.  Your computer will be able to output at a certain speed, and if you call the exit before it has time to catch up, the rest of the output will simply be lost.  By contrast:

      for (var i = 100; i < 20000; i++) {
        console.error(i.toString());
        if (i == 19990) {
          process.exit();
        }
      }

This will output every number - it will also do it more slowly, as the process doesn't move on to the next loop iteration until the output from this iteration is complete.