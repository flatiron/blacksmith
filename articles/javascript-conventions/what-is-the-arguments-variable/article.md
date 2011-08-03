The `arguments` variable has special meaning inside of a function. It is a pseudo-array of the arguments passed to the function. There is an index for each argument which was passed to the function which can be accessed through: `arguments[0]`, `arguments[1]`, etc. There also is the a property for the number of arguments which can be accessed through `arguments.length`. Finally, `arguments.callee` that holds a reference to currently executing function which can be used for recursion for anonymous functions. Here is an illustration of those principles:

    var f = function () {
      console.log("First argument: ", arguments[0]);
      console.log("Second argument: ", arguments[1]);
      console.log("Arguments length: ", arguments.length);
    }

    f(1,2,3)
    f("abc", {});

    var factorial = function (i) {
      if ( i < 2 ) { return 1; }
      return i*arguments.callee(i-1);
    }

    console.log(factorial(1));
    console.log(factorial(2));
    console.log(factorial(3));
    console.log(factorial(4));

Unfortunately, `arguments` is not a real array, so all the help functions are missing. For example, this code will fail because `arguments` has no `pop` property.

    var f = function () {
      console.log("Last argument:", arguments.pop());
    }

    f(1,2,3);

So should you ever need to manipulate the `arguments` object as if it were array, the solution is to convert it to a real array. Here is a fixed example:

    var f = function () {
      var real_array = Array.prototype.slice.call(arguments);
      console.log("Last argument:", real_array.pop());
    }

    f(1,2,3);

A final gotcha with the `arguments` array. The named parameters as well as the corresponding indexes in `arugments` array point to the same object. That means if you manipulate on of them, the other will be changed as well. So take care when you are assigning to the `arguments` or named parameters if you are using both. Here is a contrived example which demostrates the problem (the expected output would be [1,2,3], but it actually is ["random value", "random value","random value"]):

    var f = function(param1, param2, param3) {
      param1 = "random value"
      param2 = arguments[0]
      param3 = arguments[1]

      console.log(arguments)
    }

    f(1,2,3);
