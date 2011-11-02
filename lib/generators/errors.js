/*
 * errors.js: Methods for generating "error" pages (the 404 page in particular).
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var docs     = require('../docs'),
    weld     = require('weld').weld,
    markdown = require('github-flavored-markdown'),
    findit   = require('findit'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    path     = require('path'),
    helpers  = require('../helpers'),
    buildToc = require('../toc').buildToc;

var errors = exports;

errors.weld = function(dom, errs) {

  var $ = docs.window.$, // Shortcut to jquery.
      toc = buildToc(docs.src); // Generates the Table of Contents.

  Object.keys(errs).forEach(function(err) {
    var data = {
      status: errs[err].status,
      message: errs[err].message,
      toc: toc
    };

    // Grab the "error" view.
    dom.innerHTML = docs.content.theme['./error.html'].toString();

    // Weld the data to the dom.
    weld(dom, data, {
      map: function(parent, element, key, val) {

        // Handle welding the table of contents.
        if ($(element).attr("id") === "toc") {
          element.innerHTML = val;
          return false;
        }

        return true;

      }
    });

    // After welding, pull the html back out of the dom.
    errs[err].content = dom.innerHTML;
  });
  
  return dom;

};


errors.generate = function(output, errs) {

  // Write all the welded error pages to disk.
  Object.keys(errs).forEach(function(err){
    var newPath =  path.normalize("./public/" + errs[err].status + '.html');
    fs2.writeFile(newPath, errs[err].content, function(){});
  });

  return errs;
};

errors.load = function() {

  // In this case, I simply return a hash of error pages to be generated, with
  // a simple message. There is only one expected error, a 404, and its contents
  // are static, so it's simply hard-coded here.
  return {
    404: {
      status: 404,
      message: "File not found"
    }
  };
};
