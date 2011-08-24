var first = "truthy"
  , second = "also truthy";

var myvalue = first && second;
console.log(myvalue); // "also truthy"

first = null;
second = "truthy";

myvalue = first || second;
console.log(myvalue); // "truthy"

myvalue2 = second || first;
console.log(myvalue2); // "truthy"

var truthy = "truthy"
  , falsy = 0;

myvalue = truthy ? true : false;
myvalue = falsy ? true : false;
