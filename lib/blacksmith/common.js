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

common.loadSite = function (dir, callback) {
  async.parallel({
    //
    // 1. Attempt to read `.blacksmith`
    //
    options: function readBlacksmith(next) {
      utile.file.readJson(path.join(dir, '.blacksmith'), function (err, json) {
        if (err) {
          return next(err);
        }
        
        next(null, json);
      });
    },
    //
    // 2. Read all layouts.
    //
    layouts: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'layouts'),
        ext: '.html',
        allowEmpty: false
      }
    ),
    //
    // 3. Read all partials.
    //
    partials: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'partials'),
        ext: '.html',
        allowEmpty: true
      }
    ),
    //
    // 4. Read all pages.
    //
    pages: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'pages'),
        ext: '.json',
        allowEmpty: true
      }
    ),
  }, callback);
};