/*
 * content.js: Methods for generating "content" pages, such as blog posts and
 * articles. Also handles directory views if there is no content.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs2      = require('../fs2'),
    smith    = require('../blacksmith'),
    helpers  = require('../helpers');

var content = exports;

// Load all content with an fs2.readDirSync.
content.load = function () {

  // Load all the contents.
  // Pages is a hash with key/value pairs of the form `{ "path": "content" }`.
  var pages = fs2.readDirSync(smith.src, true);

  // Combine content and metadata pages to generate key/value pairs that are 1:1
  // with generated content pages.
  pages = helpers.dirToContent(smith.src, pages, true);

  return pages;
  
};
