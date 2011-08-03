var f = function(param1, param2, param3) {
  param1 = "random value"
  param2 = arguments[0]
  param3 = arguments[1]

  console.log(arguments)
}

f(1,2,3);
