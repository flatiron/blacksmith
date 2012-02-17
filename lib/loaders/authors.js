/*
 * authors.js: Methods for reading and sharing authors metadata, stored in
 * the ./authors/ directory.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */


var smith  = require('../blacksmith'),
    findit = require('findit'),
    nconf  = require('nconf'),
    path   = require('path'),
    winston = require('winston'),
    colors = require('colors'),
    fs     = require('fs');

var authors = exports;

authors.load = function (resolve) {
  var authors = {};

  // Load up a list of files to get authors metadata. Returns an nconf provider
  // for each author.

  // TODO: Use resourceful instead.
  findit.sync(path.resolve(smith.src + '/../authors')).forEach( function (file) {
    var ext = path.extname(file);
    if ( ext == '.json' ) {
      var author = new nconf.Provider(),
          id;

      author.use("file", { file: file });

      id = author.get("_id");

      if (typeof id !== "string") {
        winston.error("Error processing "+file.yellow);
        winston.warn("Missing or malformed _id field");
        return;
      }

      authors[author.get("_id").trim()] = author;
    }
  });

  // TODO: Make sure that there are no other mandatory author fields.

  return authors;
}
