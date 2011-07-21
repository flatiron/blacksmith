# The built-in globals in Node.js

Node.js has a number of built-in global identifiers that every Node.js developer should have some familiarity with.  Some of these are true globals, being visible everywhere; others exist at the module level, but are inherent to every module, thus being pseudo-globals.  

First, let's go through the list of 'true globals':

- `global` - The global namespace.  Setting a property to this namespace makes it globally visible within the running process.  
- `process` - Node's built-in `process` module, which provides interaction with the current Node process.  [Read More](link to process article)
- `console` - Node's built-in `console` module, which wraps various STDIO functionality in a browser-like way.  [Read More](link to console article)
- `setTimeout()`, `clearTimeout()`, `setInterval()`, `clearInterval()` - The built-in timer functions are globals. [Read More](link to timers article)

As mentioned above, there are also a number of 'pseudo-globals' included at the module level in every module:

- `module`, `module.exports`, `exports` - These objects all pertain to Node's module system.  [Read More](link to modules article)
- __filename - The `__filename` keyword contains the path of the currently executing file.
- __dirname - Like `__filename, the `__dirname` keyword contains the path to the root directory of the currently executing script.
- require() - The `require()` function is a built-in function, exposed per-module, that allows other valid modules to be included.  [Read More](link to require)

Much of this functionality can be extremely useful for a Node.js developer's daily life - but at the very least, remember these as bad names to use for your own functions! 
