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

//
// ### function readAll (options, callback)
// #### @options {Object} Options when reading files
// ####  @dir        {string} Directory to read
// ####  @ext        {string} Only read files with this extension.
// ####  @allowEmpty {boolan} Ignore ENOENT
//
// Reads all files in `options.dir` with `options.ext`.
//
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

//
// ### function loadSite (dir, callback)
// #### @dir {string} Directory to load site metadata from.
// #### @callback {function} Continuation to respond to when complete.
//
// Loads all rendering metadata for the site at `dir`:
// 1. .blacksmith
// 2. /layouts
// 3. /partials
// 4. /pages 
//
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

//
// ### function addDetails (content, options)
// #### @content {Object} Page content to add `page-details` to.
// #### @options {Object} Metadata to render `page-details` from.
//
// Inline renders the `page-details` metadata section for the given `content`.
//
common.addDetails = function (content, options) {
  var href = common.href(options.dir, options.fullpath);
  
  //
  // Setup default `page-details` metadata.
  //
  content.metadata                      = content.metadata || {};
  content.metadata['page-details']      = content.metadata['page-details'] || {};
  content.metadata['page-details'].date = new Date(options.stats.ctime).toLocaleDateString();
  content.metadata['page-details'].href = href.replace(path.extname(href), '');
  
  //
  // If there are files, render additional metadata about them 
  // indexed by file extension.
  //
  if (options.files) {
    content.metadata['page-details'].files = {};
    options.files.forEach(function (file) {
      var ext = path.extname(file).slice(1);
      
      content.metadata['page-details'].files[ext] = content.metadata['page-details'].files[ext] || [];
      content.metadata['page-details'].files[ext].push({
        filename: file,
        url: href + '/' + file
      });
    });
  }
};

//
// ### function href (contentDir, fullpath)
// #### @contentDir {string} Root content directory this href is inside of
// #### @fullpath {string} Full-path of the file to generate an href for.
//
// Generate the href for a given `fullpath` in the `contentDir`. e.g.:
// 
// /path/to/site/content/posts/dir-post/index.markdown
// /posts/dir-post/index.markdown
// ['', 'posts', 'dir-post', 'index.markdown']
// ['', 'posts', 'dir-post', 'index']
// ['dir-post', 'index']
// ['dir-post']
// '/dir-post
//
common.href = function (contentDir, fullpath) {
  //
  // Strip the `contentDir`, remove any containing directory,
  // split apart and trim.
  // 
  // /path/to/site/content/posts/dir-post/index.markdown
  // /posts/dir-post/index.markdown
  // ['', 'posts', 'dir-post', 'index.markdown']
  // ['', 'posts', 'dir-post', 'index']
  // ['dir-post', 'index']
  //
  var parts = fullpath.replace(contentDir, '')
    .split(path.sep)
    .map(function (part) {
      return path.basename(part, path.extname(part));
    })
    .slice(2);

  //
  // Remove any trailing 'index' references from the href. e.g.:
  //
  // ['dir-post', 'index']
  // ['dir-post']
  // 
  if (parts.length > 1 && parts[parts.length - 1] === 'index') {
    parts.pop();
  }
  
  return Array.isArray(parts)
    ? '/' + parts.join('/')
    : parts;
}