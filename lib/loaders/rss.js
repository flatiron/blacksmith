/*
 * rss.js: Methods for generating an rss feed.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = require('../blacksmith'),
    Rss     = require('rss'),
    fs2      = require('../fs2');

var rss = exports;

// Loading, in this case, consists of initializing the rss object.
// Most of the information comes from the top-level config.
rss.load = function () {
  return new Rss({
    title: smith.config.get("title") || "",
    description: smith.config.get("description") || "",
    feed_url: '/rss.xml',
    site_url: smith.config.get("url") || "",
    author: smith.config.get("author") || ""
  });
};
