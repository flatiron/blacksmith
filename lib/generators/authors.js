/*
 * authors.js: Methods for reading and sharing authors metadata, stored in
 * the ./authors/ directory.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */


var docs = require('../docs'),
    findit = require('findit'),
    nconf = require('nconf'),
    path = require('path'),
    fs = require('fs');

var authors = exports;


authors.weld = function(dom, data) {
  
  // This is where an authors page would be built, if we generated an
  // authors page.
  return data;
  
};


authors.generate = function(output, data) {

  // This is where the authors page would be written to disk, if we
  // generated an authors page.
  return;

};


authors.load = function (resolve) {
  var authors = {};

  // Load up a list of files to get authors metadata. Returns an nconf provider
  // for each author.
  findit.sync(path.resolve(docs.src + '/../authors')).forEach( function (file) {
    var ext = path.extname(file);
    if ( ext == '.json' ) {
      var author = new nconf.Provider();
      author.use("file", { file: file });
      authors[author.get("_id").trim()] = author;
    }
  });

  return authors;
}
