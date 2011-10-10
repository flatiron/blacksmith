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
