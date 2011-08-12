var myval = "value";
if(myval) {
  console.log("This value is truthy");
}

myval = 0;
if(!myval) {
  console.log("This value is falsy");
}
