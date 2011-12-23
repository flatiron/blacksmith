/*
 * theme.js: Methods for loading the site's theme.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith = require('../blacksmith'),
    findit  = require('findit'), 
    path    = require('path'),
    mkdirp  = require('mkdirp'),
    fs      = require('fs'),
    fs2     = require('../fs2'),
    helpers = require('../helpers');
    
    
var theme = exports;

theme.weld = function (dom, data) {
  
  // There is no real "weld" step for templates.
  return data;
  
};

theme.generate = function (output, files) {

  // Write theme files that *aren't* used as templates to disk.
  Object.keys(files).forEach(function (filePath) {

    // This list of template files gets filtered from the write step.
    // TODO: Find a way to generate this list programmatically.
    var templates = ['index.html', 'error.html', 'article.html'],
        basename = path.basename(filePath),
        newPath = path.resolve(smith.src + "/../public/" + filePath),
        content = files[filePath];

    // We should not copy over these templates!
    if (templates.indexOf(basename) !== -1) {
      return;
    }

    if (typeof content !== 'string' && !Buffer.isBuffer(content)) {
      smith.log.warn('Data from template '+filePath+' is of type '+(typeof content));
    }

    smith.log.debug("Writing " + newPath);

    fs2.writeFile(newPath, content, function (err) {
      if (err) {
        smith.log.error('Error while writing '+newPath+' to disk:');
        throw err;
      }
    });
  });
};
