Example:

    console.log("entering try-catch statement");

    try {
      console.log("entering try block");
      throw "thrown message";
      console.log("this message is never seen");
    }
    catch (e) {
      console.log("entering catch block");
      console.log(e);
      console.log("leaving catch block");
    }
    finally {
      console.log("entering and leaving the finally block");
    }

    console.log("leaving try-catch statement");

Results:

    entering try-catch statement
    entering try block
    entering catch block
    thrown message
    leaving catch block
    entering and leaving the finally block
    leaving try-catch statement

Javascript's try-catch-finally statement works very similarly to C++ and Java. Simply, the try block is executed until the code throws (whether it is explicitly written, the code has a ReferenceError (or similar type of error), or if it calls a function that throws). If the code doesn't throw, then the whole try block is executed. If the code threw inside the try block, then the catch block is thrown. Last of all, the finally block is always executed.

A few possible sources of confusion: The finally block pretty much always is executed. If you throw in try or catch blocks, or if you return from inside them, the finally block is still executed. It is valid javascript to omit the catch or finally block, but one of them always need to be present.

In the core node.js libraries, the only necessary place to use a try-catch is around `JSON.parse`. All of the other methods use either the standard Error object through the first parameter of the callback or emit an `error` event. Because of this, it is generally considered better to return errors through the callback than it is to throw. <link to error calllback article>
