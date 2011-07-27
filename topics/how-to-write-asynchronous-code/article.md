# How to deal with Asynchronous code

Javascript is an asynchronous language, in contrast to many synchronous languages like PHP, Ruby, Python, Perl, C, etc.  There are a number of important things to be aware of if you do not want your code to execute in extremely unexpected ways.

#Use the asycnronous functions, avoid the syncronous forms

Most functions inside node core have a syncronous version. You normally want to stay away from these because conventional node.js code uses the asyncronous code. As a quick example comparing the two methods:

    fs = require('fs');

    fs.readFile('example', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
    });
    //====================
    var data = fs.readFileSync('example','utf8');
    console.log(data);

Just looking at these two blocks of code, the syncronous version appears to be more concise. However, the asyncronous version is not more complicated for no reason. In the syncronous version, the world is paused until the file is finished reading whereas the asyncronous version gets called back while the file is reading. When the scale of things are a few small files, it does not make a big difference. However, when you have multiple requests coming in per second that require file or database IO, then it is important to do things correctly.


#Callbacks
Callbacks are a basic idiom in node.js for asyncronous operations. When most people talk about callbacks, they mean the a fuction that is passed as the last parameter to an asyncronous function. The callback is then later called with the return value. For more details, see the article on callbacks <link to article>

#Event Emitters
Event Emitters are another basic idiom in node.js. In core, there is EventEmitter class which can be found with `require('events').EventEmitter`. These are typically used when there will be multiple parts to the response, since usually you only want to call a callback once. For more details, see the article on EventEmitters < link to event emitters>

#A gotcha with asyncronous code
A common mistake in asyncronous code with javascript is to write code that does something like this:

     for (var i = 0; i < 5; i++) {
       setTimeout(function () {
         console.log(i);
       }, i);
     }

The unexpected output is then:

    5
    5
    5
    5
    5

The reason this happens is because each timeout is created and then `i` is incremented. Then when the callback is called, it looks for the value of `i` and it is 5. The solution is to create a closure so that the current value of `i` is stored. For example:

     for (var i = 0; i < 5; i++) {
       (function(i) {
         setTimeout(function () {
           console.log(i);
         }, i);
       })(i);

This gives the proper output:

    0
    1
    2
    3
    4
