var docs = require('../docs');
var findit = require('findit');
var path = require("path");

var authors = exports;

var fs = require('fs');

authors.weld = function(dom, data) {
  
  // perform weld, build authors page
  
  return data;
  
};

authors.generate = function(output, data) {
  // write author page to file system
  //fs.writeFileSync('./public/toc.html', JSON.stringify(output, true, 2));
};

//Loads up the "authors" data
authors.load = function (resolve) {
  var authors = {};
  var _authors = findit.sync(path.resolve(__dirname+'/../../authors'));
  _authors.forEach( function (file) {
    var ext = path.extname(file);
    if ( ext == '.json' ) {
      try {
        var author =  JSON.parse(fs.readFileSync(file).toString());
        authors[author._id] = author;
      } catch (err) {
        console.log('Error on ' + file + ': '+err.message);
        console.log('Ignoring.');
      }
    }
  });
  return authors;
};
