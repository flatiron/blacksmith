/*
 * blacksmith.js: Top-level include for Blacksmith
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */
 
var Site = require('./blacksmith/site');

module.exports = function (dir, callback) {
  var site = new Site(dir);
  
  site.render(function (err, results) {
    return err ? callback(err) : callback(null, results);
  });
};