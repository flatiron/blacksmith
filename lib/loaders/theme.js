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

  // Check to make sure all the "mandatory" templates are in ./theme .
  // TODO: Build site with minimal views to make sure it works.
  // TODO: Use internal base templates so that these are all optional.
  [
    'article',
    'directory',
    'error'
  ].forEach(function (n) {
    if (!theme['./' + n + '.html']) {
      throw new Error('Missing theme file ' + path.resolve('./theme/'+n + '.html'));
    }
  });

  // Aliases for optional templates.
  if (!theme['./archive.html']) {
    theme['./archive.html'] = theme['./article.html'];
  }

  return theme;
  
};
