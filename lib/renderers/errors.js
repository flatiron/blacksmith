/*
 * errors.js: Methods for generating "error" pages (the 404 page in particular).
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith     = require('../blacksmith'),
    weld     = require('weld').weld,
    findit   = require('findit'),
    fs2      = require('../fs2'),
    path     = require('path'),
    helpers  = require('../helpers'),
    buildToc = require('../toc').buildToc;

var errors = exports;

errors.weld = function(dom, errs) {

  var $ = smith.window.$, // Shortcut to jquery.
      toc = smith.content.toc;

  Object.keys(errs).forEach(function(err) {
    var data = {
      status: errs[err].status,
      message: errs[err].message,
      toc: toc
    };

    // Grab the "error" view.
    try {
      dom.innerHTML = smith.content.theme['./error.html'].toString();
    }
    catch (e) {
      smith.log.silly('Error while rendering error' + errs[err].status+ ' page with theme '+path.resolve('./theme/error.html'));
      throw e;
    }

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
    smith.log.silly('Successfully completed weld step for error ' + errs[err].status);
    errs[err].content = dom.innerHTML;
  });
  
  return dom;

};


errors.generate = function(output, errs) {

  // Write all the welded error pages to disk.
  Object.keys(errs).forEach(function(err){
    var newPath =  path.resolve("./public/" + errs[err].status + '.html'),
        content = errs[err].content;

    if (typeof content !== 'string') {
      smith.log.warn('Content from '+file+' is of type '+(typeof content));
    }


    smith.log.debug("Writing " + newPath);

    fs2.writeFile(newPath, content, function (err) {
      if (err) {
        smith.log.error('Error while writing '+newPath+' to disk:');
        throw err;
      }
    });
  });

  return errs;
};
