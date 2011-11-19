var smith   = require("../blacksmith"),
    fs      = require('fs'),
    winston = require('winston'),
    cp      = require('ncp').ncp,
    prompt  = require("prompt");

module.exports = function () {

  var argv = Array.prototype.slice.call(),
      sitename = argv[0];

  // I can't pass this in as an extra argument through flatiron.cli ?
  sitename = "blog";

  smith.sites(function (err, sites) {
    if (err) {
      throw err;
    }

    if (sitename) {

      prompt.start();

      console.log("FILEBOMB ./"+sitename);
      prompt.get("okay", function (i) {
        // TODO: Add y/N functionality here

        cp(sites[sitename], './'+sitename, function (err) {
          if (err) {
            throw err;
          }

          console.log("Wrote to ./"+sitename+".")
        });

      });
    }
    else {
      console.log("No. (ok)");
    }
  });
}
