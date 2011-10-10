var myfunc = function(one) {
  arguments.callee === myfunc;
  arguments[0] === one;
  arguments[1] === 2;
  arguments.length === 3;
}

myfunc(1, 2, 3);
