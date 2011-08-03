var f = function () {
  var real_array = Array.prototype.slice.call(arguments);
  console.log("Last argument:", real_array.pop());
}

f(1,2,3);
