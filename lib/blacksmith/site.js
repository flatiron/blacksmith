/*
 * site.js: An entire blacksmith site with layouts, partials, pages, content, and metadata
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    utile = require('flatiron').common,
    async = utile.async,
    inflect = utile.inflect,
    common = require('./common'),
    Page = require('./page');

//
// ### function Site (options)
// #### @options {Object} Options for the site
// TODO: DOCUMENT OPTIONS!!!!
// 
// Constructor function for the Site object representing an entire blacksmith
// site with layouts, partials, pages, content, and metadata.
//
var Site = module.exports = function (dir) {
  if (!dir) {
    throw new Error('Directory of the site is required');
  };
  
  this.dir = dir;
  this.options = { dir: dir };
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
//
// Loads all relevant files for this site using the following workflow:
//
// 1. Attempt to read `.blacksmith`
// 2. Read all layouts.
// 3. Read all partials.
// 4. Read all pages.
//
Site.prototype.load = function (callback) {
  var dir = path.normalize(this.dir),
      self = this;

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
  }, function (err, results) {
    if (err) {
      return callback(err);
    }
    
    //
    // Merge results back onto this instance
    //
    self.options = utile.mixin(self.options, results.options);
    
    //
    // If there are JSON page files in `/pages` and pages
    // are specified in `.blacksmith` merge each page options.
    //
    if (results.pages && self.options.pages) {
      Object.keys(results.pages).forEach(function (page) {
        self.options.pages[page] = utile.mixin(
          self.options.pages[page] || {},
          results.pages[page]
        );
      });
    }
    else {
      self.options.pages = results.pages || {};
    }
    
    self.html = {
      layouts: results.layouts,
      partials: results.partials || {}
    };
    
    callback(null, {
      options: self.options,
      html: self.html
    });
  });
};

//
// ### function render (callback)
// #### @callback {function} Continuation to respond to when complete.
//
// Renders everything associated with this site instance using the following workflow:
// 
// 1. Load all HTML and metadata
// 2. Render all content in `/content`.
//
// TODO: Do pages write to disk or do we buffer?
//
// 3. Write all content to disk.
//
Site.prototype.render = function (callback) {
  var dir = path.normalize(this.dir),
      self = this,
      rendered;
  
  //
  // 1. Load all HTML and metadata in:
  //   * /.blacksmith
  //   * /layouts
  //   * /pages
  //   * /partials
  //
  this.load(function (err) {
    if (err) {
      return callback(err);
    }
    
    //
    // 2. Render all content in `/content`. For each file:
    //   a. Parse the Markdown using `marked`
    //   b. Read all metadata into a JSON object, looking up 
    //      references as necessary (e.g. author)
    //   c. Generate HTML from Markdown
    //   d. Read the layout for the page, using default if none specified
    //   e. Render any additional sections based on metadata using plates
    //   f. Render the layout with the HTML for the content and section(s)
    //   g. Write the rendered HTML to disk in the correct location.
    //
    self.renderDir(path.join(dir, 'content'), function (err, rendered) {
      return err ? callback(err) : callback(rendered);
    });
  });
};

//
// ### function renderDir (dir, callback)
// #### @dir {string} Directory to render files in.
// #### @callback {function} Continuation to respond to when complete.
//
// Renders all files and directories in the specified `dir` searching
// recursively if necessary. 
//
Site.prototype.renderDir = function (dir, callback) {
  var rendered = {},
      self = this;
  
  //
  // List files in the directory.
  //
  fs.readdir(dir, function (err, files) {
    if (err) {
      return callback(err);
    }
    
    //
    // Ignore all dotfiles 
    //
    files = files.filter(function (file) {
      return file[0] !== '.';
    });
    
    if (!files.length) {
      return callback(new Error('No files found to render'));
    }
    
    //
    // Iterate over all files and directories found with a concurrency
    // of 10. 
    //
    // * For directories continue to search recursively for more files.
    // * For files render them immediately.
    //
    async.forEachLimit(
      files,
      10,
      function renderFile(file, next) {
        var fullpath = path.join(dir, file);
        
        fs.stat(fullpath, function (err, stats) {
          if (err) {
            return next(err);
          }
          
          //
          // ### function onRendered
          // Adds the results to the set of rendered files.
          //
          function onRendered(err, results) {
            if (err) {
              return next(err);
            }
            
            rendered[file] = results;
            next();
          }
          
          //
          // If it is a directory recursively render it and add
          // it to the set of rendered file paths.
          //
          if (stats.isDirectory()) {
            return self.renderDir(fullpath, onRendered);
          }
          
          //
          // Otherwise render it immediately
          //
          self.renderPage({
            dir: path.basename(dir),
            file: fullpath
          }, onRendered);
        });        
      },
      function (err) {
        return err ? callback(err) : callback(null, rendered);
      }
    );
  });
};

//
// ### function renderPage (options, callback) 
// #### @options {Object} Options for the site
// TODO: DOCUMENT OPTIONS!!!!
// #### @callback {function} Continuation to respond to when complete.
//
// Renders a given page within a directory passing along relevant rendering
// information (layout, partials, etc) from this site instance.
//
// Remark: metadata-only pages (like index, archive) are not generated yet.
//
Site.prototype.renderPage = function (options, callback) {
  
};