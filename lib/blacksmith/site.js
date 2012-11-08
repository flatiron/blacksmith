/*
 * site.js: An entire blacksmith site with layouts, sections, pages, and metadata
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    utile = require('flatiron').common,
    async = utile.async,
    Page = require('./page');

var Site = module.exports = function (options) {
  if (!options || (typeof options !== 'string' && !options.dir)) {
    throw new Error('Site options must be a string or contain a `dir` property');
  };
  
  if (typeof options === 'string') {
    this.dir = options;
    this.options = { dir: options };
  }
  else {
    this.dir = options.dir;
    this.options = options;
  }
};

Site.prototype.generate = function (callback) {
  var dir = path.normalize(this.dir),
      self = this;
  
  //
  // Site generation workflow
  // 1. Attempt to read `.blacksmith`
  // 2. Read all pages in `/pages`
  // 3. For each page:
  //   a. Parse the Markdown using `marked`
  //   b. Read all metadata into a JSON object, looking up 
  //      references as necessary (e.g. author)
  //   c. Generate HTML from Markdown
  //   d. Read the layout for the page, using default if none specified
  //   e. Render any additional sections based on metadata using plates
  //   f. Render the layout with the HTML for the content and section(s)
  //   g. Write the rendered HTML to disk in the correct location.
  //
  async.series([
    //
    // 1. Attempt to read `.blacksmith`
    //
    function readBlacksmith(next) {
      utile.file.readJson(path.join(dir, '.blacksmith'), 'utf8', function (err, json) {
        if (err) {
          return next(err);
        }
        
        utile.mixin(self.options, json);
      });
    },
    //
    // 2. Read all pages in `/pages`
    //
    function listPages(next) {
      fs.readdir(path.join(dir, 'pages'), function (err, pages) {
        if (err) {
          return next(err);
        }
        
        //
        // Filter pages to ignore dotfiles
        //
        pages = pages.filter(function (page) {
          return page[0] !== '.';
        });
        
        if (!pages.length) {
          return next(new Error('No pages found to render'));
        }
        
        //
        // Render each page with a limit of 10
        //
        async.forEachLimit(
          pages,
          10,
          function renderPage(page, done) {
            (new Page(path.join(dir, 'pages', page))).generate(done);
          },
          next
        );
      });
    }
  ], callback);
};