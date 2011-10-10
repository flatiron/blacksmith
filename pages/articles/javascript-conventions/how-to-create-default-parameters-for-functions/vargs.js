var Args = require("vargs").Constructor;

example = function () {
  var args = new Args(arguments);
  args.callback.apply({},args.all);
}

example("The first parameter", console.log);
example("The first parameter", "and second parameter", console.log);
example("The first parameter", "and second parameter", "and third parameter", console.log);
example("The first parameter", "and second parameter", "and third parameter", "etc", console.log);
