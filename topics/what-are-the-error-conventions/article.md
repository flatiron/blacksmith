
    In node.js, it is generally considered standard to pass errors through the callback. Generally, the first parameter of the callback is reserved for errors. If there is an error, the first parameter is passed an `Error` object with all the details. Otherwise, the first parameter is null. So as a quick demonstration:

    var isTrue = function(value, callback) {
      if (value === true) {
        callback(null, "The super secret password is", "password");
      }
      else {
        callback(new Error("You did not pass true"));
      }
    }

    var callback = function (error, sentence, password) {
      if (error) {
        console.log(error);
        return;
      }
      console.log(sentence, password);
    }

    //Note: there is no race condition because all this code is going to be called synchronously
    //    however, in proper asyncronous code, the order that the callbacks get called in is undefined.
    isTrue(false, callback);
    isTrue(true,  callback);

    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'You did not pass true' }
    The super secret password is password

As you can see in the `isTrue` function, the callback is called with null in the first parameter if there is no error. However, if there is an error, you create an `Error` object and pass it into the first parameter. The `callback` function shows the standard idiom of immediately checking the  existance of the `error` parameter and handling it, if it doesn't exist continue with normal process.

So to wrap it all up, if you are calling a callback, if an error comes up, then pass it through the first parameter, otherwise pass null. Inside of a callback, check if the first parameter is non-null and handle if the error if it exists
