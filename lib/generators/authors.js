/*
 * authors.js: Methods for reading and sharing authors metadata, stored in
 * the ./authors/ directory.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */


var docs = require('../docs'),
    findit = require('findit'),
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

  // Load up a list of files to get authors metadata. Returns a hash of authors.
  // TODO: Use nconf.
  findit.sync(path.resolve(docs.src + '/../authors')).forEach( function (file) {
    var ext = path.extname(file);
    if ( ext == '.json' ) {
      try {
        var author =  JSON.parse(fs.readFileSync(file).toString());
        authors[author._id] = author;
      } catch (err) {
        console.log('Error loading author file ' + file + ': '+err.message);
        console.log('Ignoring.');
      }
    }
  });

  return authors;
}
