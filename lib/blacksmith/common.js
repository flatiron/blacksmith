/*
 * common.js: Common utility functions for blacksmith
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */
 
var fs = require('fs'),
    path = require('path'),
    utile = require('flatiron').common,
    async = utile.async;
    
var common = exports;

common.readAll = function (options, callback) {
  fs.readdir(options.dir, function (err, files) {
    if (err && err.code !== 'ENOENT') {
      return callback(err);
    }
    else if (err && err.code === 'ENOENT' && options.allowEmpty) {
      return callback(null, {});
    }

    //
    // Filter content files to ignore dotfiles
    //
    files = files.filter(function (file) {
      return path.extname(file) === options.ext;
    });
    
    if (!files.length) {
      return callback();
    }
    
    var results = {};
    
    //
    // Read all files asynchronously parsing JSON if necessary
    //
    async.forEach(
      files,
      function readFile(file, next) {
        fs.readFile(path.join(options.dir, file), 'utf8', function (err, data) {
          if (err) {
            return next(err);
          }
          
          if (options.ext === '.json') {
            try { data = JSON.parse(data) }
            catch (ex) { return next(ex) }
          }
          
          results[path.basename(file, options.ext)] = data;
          next();
        });
      },
      function (err) {
        return err ? callback(err) : callback(null, results);
      }
    )
  });
};