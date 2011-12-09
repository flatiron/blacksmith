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

theme.load = function () {
  
  // Read in all the files in the themes directory, and filter directories.
  var _theme = fs2.readDirSync(smith.src + '/../theme', true, function (p) {
    return !fs.statSync(p).isDirectory();
  });

  var theme = {};

  // The keys that come back from fs2.readDirSync are absolute. This makes it
  // difficult to refer to the right templates later, so here we use the
  // file paths relative to ./theme instead as keys instead.
  Object.keys(_theme).forEach(function (k) {
    var newK = helpers.unresolve(path.normalize(smith.src + '/../theme'), k);
    theme[newK] = _theme[k];
  });

  if (!theme['./all.html']) {
    // fallback in case you don't need an all.html
    theme['./all.html'] = theme['./article.html'];
  }

  return theme;
  
};
