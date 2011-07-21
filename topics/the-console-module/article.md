# What is the `console` object?

Anyone familiar with browser-side development has probably used `console.log` for debugging purposes - Node.js has implemented a built-in `console` object to mimic much of this experience.  Since we're working server-side, however, it wraps `stdout`, `stdin`, and `stderr` instead of the browser's debugging console.

Because of this browser parallel, the `console` module has become home to quite a bit of Node's standard output functionality.  The simplest is `console.log()`. 

     console.log('Hi, everybody!');
     console.log('This script is:', __filename);
     console.log(__filename, process.title, process.argv);

The first, simplest example just prints the provided string to `stdout`.  It can also be used to output the contents of variables, as evidenced in #2; furthermore, `console.dir()` is called on any objects passed in as arguments, enumerating their properties.  

NODE.JS PRO TIP:
`console.log()` accepts printf-style format strings!  This is more advanced, but worth mentioning briefly.

     var name = 'Harry';
     console.log('My name is %s', name);


`console.dir()`, as mentioned above, is an alias for `util.inspect()` - it is used to enumerate object properties.  [Read More](link to util.inspect article)

`console.error()` is the same as `console.log`, except that the output is sent to `stderr` instead of `stdout`.

That covers the basic `console` module functionality, but there are a few other methods worth mentioning as well.  First, the `console` module allows for the marking of time via `console.time()` and `console.timeEnd()`.  Here is an example:

     console.time('myTimer');
     var string = '';
     for (var i = 0; i < 300; i++) {
       (function (i) {
         string += 'aaaa' + i.toString();
       })(i);
     }
     console.timeEnd('myTimer');
     
This would determine the amount of time taken to perform the actions in between the `console.time` and `console.timeEnd` calls.

One last function worth mentioning is `console.trace()`, which prints a stack trace to its location in your code without throwing an error.  This can occasionally be useful if you'd like to figure out where a particular failing function was called from. 
