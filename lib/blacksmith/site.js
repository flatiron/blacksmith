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
    content = require('./content'),
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

  //
  // Load all site files.
  //
  common.loadSite(dir, function (err, results) {
    if (err) {
      return callback(err);
    }
    
    //
    // Merge results back onto this instance
    //
    self.options        = utile.mixin(self.options, results.options);
    self.options.layout = self.options.layout || 'default';
    
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
      rendered = {},
      self = this;

  async.waterfall([
    //
    // 1. Load all HTML and metadata in:
    //   * /.blacksmith
    //   * /layouts
    //   * /pages
    //   * /partials
    //
    function loadSite(next) {
      self.load(function (err) {
        return err ? next(err) : next();
      });
    },
    //
    // 2. Render all content in `/content`. For each file:
    //   a. Parse the Markdown using `marked`
    //   b. Read all metadata into a JSON object, looking up 
    //      references as necessary (e.g. author)
    //   c. Generate HTML from Markdown
    //
    function renderContent(next) {
      self.renderContent(path.join(dir, 'content'), next);
    },
    //
    // 3. Render all pages in `self.options.pages`
    //
    function renderPages(content, next) {
      Object.keys(self.options.pages).forEach(
        function renderPage(name) {
          //
          // Create a page with all relevant rendering metadata
          //
          // TODO: Support shared layout templates!!!
          //
          var page = new Page({
            name:    name,
            dir:     self.dir,
            layout:  self.options.pages[name].layout || self.layout,
            options: self.options.pages[name],
            html:    self.html,
            content: content
          });
          
          //
          // Fully render all files associated with this page
          //
          //
          // If the `content` has a pluralized key to the page `name`,
          // then mixin the rendered page results. e.g.
          //
          // name = 'post'
          // content = { posts: { ... } }
          //
          // Conversely if no such convention exits just set the key
          // `name` in the fully rendered page to the results. e.g.
          //
          // name = 'index'
          // content = { posts: { ... } }
          //
          var plural = inflect.pluralize(name);
          
          if (typeof content[plural] === 'object') {
            utile.mixin(rendered, page.renderAll());
          }
          else {
            rendered[name] = page.renderAll();
          } 
        }
      );
      
      next();
    },
    //
    // 4. Write all rendered content to /public
    //
    //
    // TODO: Write this!!!
    //
  ], function (err) {
    return 
  });  
};

//
// ### function renderContent (dir, callback)
// #### @dir {string} Directory to render content files in.
// #### @callback {function} Continuation to respond to when complete.
//
// Renders all content files and directories in the specified `dir` searching
// recursively if necessary. The data structure returned is relatively simple:
//
// {
//   posts: {
//     "a-post.md": { html: "..", markdown: "..", metadata: { ... } }
//     "a-folder": {
//       index: { html: "..", markdown: "..", metadata: { ... } },
//       files: ['file1.js', 'img1.png' ...]
//     }
//   }
//   ...
// }
//
Site.prototype.renderContent = function (dir, callback) {
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
    // Ignore all dotfiles.
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
    // * For Markdown content render them and place the results
    //   in the content hierarchy.
    // * For directories continue to search recursively for more files.
    // * For files append them to the "files" property of rendered content
    //   for later copying.
    //
    async.forEachLimit(
      files,
      10,
      function renderFile(file, next) {
        var fullpath = path.join(dir, file),
            ext = path.extname(file);

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
            return self.renderContent(fullpath, onRendered);
          }
          //
          // If it is a markdown file render it immediately.
          //
          else if (ext === '.md' || ext === '.markdown') {
            return content.render({
              file: fullpath,
              marked: self.marked
            }, onRendered);
          }
          
          //
          // Otherwise add it to the list of files for this dir for
          // later copying
          //
          rendered.files = rendered.files || [];
          rendered.files.push(file);
          next();
        });        
      }, 
      function (err) {
        return err ? callback(err) : callback(null, rendered);
      }
    );
  });
};