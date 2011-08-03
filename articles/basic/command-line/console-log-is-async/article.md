# Console.log is asynchronous - watch out!

In Node.js, there are a number of different built-in methods available that will all ultimately result in output reaching the console.  Under the hood, all of these different methods do one of two things: they either write to `stdout` asynchronously, or they write to `stderr` synchronously.

A given operating system can only write out so much at a time - when there's a lot to write, it gets added to a write buffer, and the OS keeps taking as much as it can handle out of the buffer, chunk by chunk, until there's nothing else to write.  Once the OS is crunching away on your output, there are only two things for a program to do: block and wait, or move on and let the OS do its thing.

The first way - blocking and waiting - is what the `stderr` methods do in Node.js.  There's a function called `writeError` in Node core that does exactly this - if the output is buffered, it sleeps for 100 microseconds and tries to write again, until the write buffer is completed.  When dealing with errors, this can make sense - you want the message when it happens, as opposed to when the OS gets around to showing it to you.

In Node, `console.warn`, `console.error`, and `util.debug` all call `writeError` under the hood.

The other way to do things is the asynchronous way - instead of waiting for the OS, you just keep adding to the write buffer, and your Node process is free to take care of other things - like the rest of your code.

In Node, `console.log`, `console.info`, `util.print`, and `util.puts` all write to `stdout` asynchronously.

Be careful, though - asynchronous output isn't always what you'd expect.  You have no guarantee of the output completing at a specific time - it's a race condition you'll usually win, but a race condition nonetheless.