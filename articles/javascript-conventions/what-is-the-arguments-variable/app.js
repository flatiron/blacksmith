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

