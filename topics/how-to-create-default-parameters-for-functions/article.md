Usually a function will take a set number of parameters and requires that all of them to be present. However, sometimes you will run into situations where you want to provide a default value for a parameter or take a variable number of parameters. Unfortunately, javascript does not have a builtin way to do that, so over time, people have developed idioms to achieve the functionality.

The first idiom is giving a default value for the last parameter. This is done by checking if the last parameter is `undefined` and setting it to a default value if it is. Sometimes people user the idiom: `optional_parameter = optional_parameter || default_value`. This can have some undesirable behavior when they pass values that are equal to false such as `false`, `0`, and `""`. So a better way to do this is by explicitly checking that the optional parameter is `undefined`. Here is some code showing the two styles and the differing behavior:

    example = function (opt_parameter) {
      opt_parameter = opt_parameter || "No parameter was passed"
      console.log(opt_parameter);
    }

    better_example = function (opt_parameter) {
      if (opt_parameter === undefined) {
        opt_parameter = "No parameter was passed"
      }
      console.log(opt_parameter);
    }

    console.log("Without parameter:");
    example();
    better_example();

    console.log("\nWith paramater:");
    example("parameter was passed");
    better_example("parameter was passed");

    console.log("\nEmpty String:");
    example("");
    better_example("");


If the optional value is in the middle it can cause some undesired effects, since all the parameters shift over. The optional parameter is not the `undefined` value, the last parameter is the `undefined` one. So you have to check if the last parameter is `undefined` and then manually fix all the parameters before continuing in the code. This code shows you how to do that:

    example = function (param1, opt_param, callback) {
      if (callback === undefined) {
        // only two paramaters were passed, so the callback is actually in `opt_param`
        callback = opt_param;

        //give `opt_param` a default value
        opt_param = "and a default parameter";
      }
      callback(param1, opt_param);
    }

    example("This is a necessary parameter", console.log);
    example("This is a necessary parameter", "and unnecessary parameter", console.log);

More complicated cases require more code and can obstruct the meaning of what you are trying to do. It becomes a good idea to use helper functions. For example, suppose we wanted to take a variable amount of parameters and pass them all to the callback. You could try to emulate this effect by manipulating the `arguments` variable, however, it is just easier to use the [vargs](https://github.com/cloudhead/vargs) As you can see by this code, it makes the whole process a little simpler:

    var Args = require("vargs").Constructor;

    example = function () {
      var args = new Args(arguments);
      args.callback.apply({},args.all);
    }

    example("The first parameter", console.log);
    example("The first parameter", "and second parameter", console.log);
    example("The first parameter", "and second parameter", "and third parameter", console.log);
    example("The first parameter", "and second parameter", "and third parameter", "etc", console.log);
