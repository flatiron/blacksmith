var smith   = require("../blacksmith"),
    fs      = require('fs'),
    winston = require('winston'),
    cp     = require('ncp'),
    prompt  = require("prompt");

module.exports = function () {

  var argv = Array.prototype.slice.call(arguments);

  smith.sites(function (err, sites) {
    if (err) {
      throw err;
    }

    console.log(sites);
  });


}
