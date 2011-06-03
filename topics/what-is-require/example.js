console.log("evaluating example.js");

no_one_can_see_this = function () {
  console.log("invisible");
}

exports.message = "hi";

exports.say = function () {
  console.log(message);
}
