/*
 * content.js: Methods for generating "content" pages, such as blog posts and
 * articles. Also handles directory views if there is no content.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var findit   = require('findit'), 
    path     = require('path'),
    hl       = require('../../vendor/highlight/lib/highlight').Highlight,
    markdown = require('github-flavored-markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    smith    = require('../blacksmith'),
    weld     = require('weld').weld,
    util     = require('util'),
    helpers  = require('../helpers');

var content = exports;

// Load all content with an fs2.readDirSync.
content.load = function () {
  if (!smith.src) {
    smith.src = "../../pages";
  }

  // Load all the contents.
  // Pages is a hash with key/value pairs of the form `{ "path": "content" }`.
  var pages = fs2.readDirSync(smith.src, true);

  // Combine content and metadata pages to generate key/value pairs that are 1:1
  // with generated content pages.
  pages = helpers.dirToContent(smith.src, pages, true);

  return pages;
  
};
