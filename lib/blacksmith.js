/*
 * blacksmith.js: Top-level include for Blacksmith
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var Site = require('./blacksmith/site');

//
// ### function exports (dir, callback)
// #### @dir {string} Directory to generate a site from
// #### @callback {function} Continuation to respond to when complete
//
// Renders a complete blacksmith site from the specified `dir`.
//
module.exports = function (dir, callback) {
  var site = new Site(dir);

  return site.render(function (err, results) {
    return err ? callback(err) : callback(null, results);
  });
};