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
