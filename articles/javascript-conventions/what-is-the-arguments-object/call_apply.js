myfunc.apply(obj, arguments).

// concat arguments onto the 
Array.prototype.concat.apply([1,2,3], arguments).

// turn arguments into a true array
var args = Array.prototype.slice.call(arguments);

// cut out first argument
args = Array.prototype.slice.call(arguments, 1);
