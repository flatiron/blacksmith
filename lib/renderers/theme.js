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
    var templates = ['index.html', 'error.html', 'article.html'];

    if (templates.indexOf(path.basename(filePath)) !== -1) {
      return;
    }

    var newPath = smith.src + "/../public/" + filePath;

    smith.log.info("Writing " + newPath);

    fs2.writeFile(newPath, files[filePath], function (){ });
  });
};
