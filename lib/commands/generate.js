var smith = require("../blacksmith"),
    winston = require("winston"),
    fs = require("fs"),
    colors = require("colors"),
    path = require("path");

// Flatiron prints the "usage" text instead.
module.exports = function () {
  winston.info("Executing command "+"generate".yellow);


  // Check to see if the required directories exist.
  var exists = {};
  [ "./pages", "./authors", "./theme" ].forEach(function(dir) {
    exists[dir] = path.existsSync(dir)
      && fs.statSync(dir).isDirectory();
  });

  if (Object.keys(exists).every(function(k) {
    return exists[k];
  })) {
    smith.generate("./pages", "./public", function (status) {
      // Because writes are fire-and-forget, we can't process.exit until they
      // are all done. So, instead, let's just print "blacksmith ok" for now,
      // and figure out how to do it the "right way" later.
      if (status) {
        winston.info("Blacksmith".yellow + " not ok".red.bold);
      } else {
        winston.info("Blacksmith".yellow + " ok".green.bold);
      }
    });

  } else {
    winston.error([
      "Missing blacksmith site folders: "
      + Object.keys(exists).filter(function(f) {
          return !exists[f];
        }).join(", ").bold.yellow,
    ].join("\n"));

    [
      "",
      "The easiest way to start a " + "blacksmith".yellow
        + " site is to use " + "jitsu".cyan + ":",
      "",
      "    jitsu install blog".yellow,
      "",
      "You can learn more about jitsu at "
        + "http://github.com/nodejitsu/jitsu".yellow,
      ""
    ].forEach(winston.help);
  }
};
