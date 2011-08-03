var npm = require("npm")

npm.load({"-s":"true", "s": "true", "-silent":"true", "silient":"true"}, function (er) {
  if (er) return handlError(er)
  npm.commands.install(["vows", "eyes"], function (er, data) {
    if (er) return console.log("There was an error:", er);
    console.log("Just installed the programs");
  })
})
