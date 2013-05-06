/*
 * site.js: An entire blacksmith site with layouts, partials, pages, content, and metadata
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var events = require('events'),
    fs = require('fs'),
    path = require('path'),
    timespan = require('timespan'),
    utile = require('flatiron').common,
    async = utile.async,
    cpr = utile.cpr,
    inflect = utile.inflect,
    mkdirp = utile.mkdirp,
    common = require('./common'),
    content = require('./content'),
    Page = require('./page');

//
// ### function Site (options)
// #### @options {Object} Options for rendering this site.
// ####   @dir   {string} Root directory for this site
// ####   @since {string} Only pages modified after this date will be written to public
//
// Constructor function for the Site object representing an entire blacksmith
// site with layouts, partials, pages, content, and metadata.
//
var Site = module.exports = function (options) {
  if (!options || (typeof options !== 'string' && !options.dir)) {
    throw new Error('Directory of the site is required');
  }
  else if (typeof options === 'string') {
    options = { dir: options };
  }

  events.EventEmitter.call(this);

  this.dir   = options.dir;
  this.since = options.since
    ? timespan.parseDate(options.since)
    : timespan.parseDate('NOW-10YEARS');
};

//
// Inherit from `events.EventEmitter`.
//
utile.inherits(Site, events.EventEmitter);

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
  this.emit('load:start', this.dir);
  common.loadSite(dir, function (err, results) {
    if (err) {
      return callback(err);
    }

    //
    // Merge results back onto this instance
    //
    self.layout = results.options.layout || self.layout || 'default';
    ['layouts', 'pages', 'partials'].forEach(function (key) {
      //
      // If there are JSON page files in `/[component]` and `{ [component]: {} }`
      // are specified in `.blacksmith` merge each page options.
      //
      self[key] = results.options[key];
      if (results[key] && self[key]) {
        Object.keys(results[key]).forEach(function (item) {
          self[key][item] = utile.mixin(
            self[key][item] || {},
            results[key][item]
          );
        });
      }
      else {
        self[key] = results[key] || {};
      }
    });

    self.html       = results.html;
    self.references = results.references || {};

    self.emit('load:end', self.dir);

    callback(null, {
      dir:        self.dir,
      html:       self.html,
      pages:      self.pages,
      layout:     self.layout,
      layouts:    self.layouts,
      partials:   self.partials,
      references: self.references
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
// 3. Render all pages in `this.pages`.
// 4. Write all content to disk.
//
Site.prototype.render = function (callback) {
  var dir = path.normalize(this.dir),
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
    // 3. Render all pages in `self.pages`
    //
    function renderPages(content, next) {
      var rendered = {};

      Object.keys(self.pages).forEach(
        function renderPage(name) {
          //
          // Create a page with all relevant rendering metadata
          //
          // TODO: Support shared layout templates!!!
          //
          var page = new Page({
            name:       name,
            dir:        self.dir,
            layout:     self.pages[name].layout || self.layout,
            options:    self.pages[name],
            html:       self.html,
            content:    content,
            references: self.references,
            partials:   self.partials
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
          // Conversely if no such convention exists just set the key
          // `name` in the fully rendered page to the results. e.g.
          //
          // name = 'index'
          // content = { posts: { ... } }
          //
          if (typeof content[inflect.pluralize(name)] === 'object') {
            utile.mixin(rendered, page.renderAll());
          }
          else {
            rendered[name] = page.renderAll();
          }
        }
      );

      next(null, rendered);
    },
    //
    // 4. Write all rendered content to /public
    //
    function writeFiles(rendered, next) {
      self.writeFiles(rendered, next);
    }
  ], function (err, _) {
    return err ? callback(err) : callback();
  });

  return this;
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
//     "a-post.md": { _content: { html: "..", markdown: "..", metadata: { ... } } }
//     "a-folder": {
//       _content: {
//         { html: "..", markdown: "..", metadata: { ... } }
//       },
//       _files: ['file1.js', 'img1.png' ...]
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

    var supporting = [],
        markdown = [],
        dirs = [];

    //
    // Separate all markdown (.md, .markdown), supporting (non-markdown),
    // and directories ignoring all dotfiles.
    //
    files = files.forEach(function (file) {
      if (file[0] === '.') {
        return;
      }

      var ext = path.extname(file);

      if (ext === '.md' || ext === '.markdown') {
        markdown.push(file);
      }
      else if (ext.length) {
        supporting.push(file);
      }
      else {
        dirs.push(file);
      }
    });

    if (!supporting.length && !markdown.length && !dirs.length) {
      return callback(new Error('No files found to render'));
    }

    //
    // In parallel over all files and directories found with a concurrency
    // of 10.
    //
    async.parallel([
      //
      // * For Markdown content render them and place the results
      //   in the content hierarchy.
      //
      function renderMarkdowns(done) {
        async.forEachLimit(
          markdown,
          10,
          function renderMarkdown(file, next) {
            var fullpath = path.join(dir, file),
                ext = path.extname(file),
                name = path.basename(file, ext);

            fs.stat(fullpath, function (err, stats) {
              if (err) {
                return next(err);
              }

              content.render({
                source: fullpath,
                marked: self.marked,
                files: supporting,
                dir: dir
              }, function onMarkdown(err, results) {
                if (err) {
                  return next(err);
                }

                rendered[name] = {
                  _content: results,
                  _date: results.metadata.date
                    ? new Date(results.metadata.date)
                    : new Date(stats.ctime)
                };

                common.addDetails(rendered[name]._content, {
                  dir: path.join(self.dir, 'content'),
                  fullpath: fullpath,
                  files: supporting,
                  stats: stats
                });

                if (name === 'index') {
                  //
                  // Hoist the date associated with `index.md` files to
                  // the directory itself.
                  //
                  rendered._date = rendered[name]._date;
                }

                next();
              });
            });
          },
          done
        );
      },
      //
      // * For directories continue to search recursively for more files.
      //
      function renderDirs(done) {
        async.forEachLimit(
          dirs,
          10,
          function renderDir(file, next) {
            var fullpath = path.join(dir, file);

            self.renderContent(fullpath, function onDir(err, results) {
              if (err) {
                return next(err);
              }

              rendered[file] = results;
              next();
            });
          },
          done
        );
      }
    ], function (err) {
      if (err) {
        return callback(err);
      }

      //
      // If there are any supporting files set them to the
      // `_files` property on the rendered content.
      //
      if (supporting.length) {
        if (rendered.index) {
          rendered.index._files = supporting;
        }
        else {
          rendered._files = supporting;
        }
      }

      callback(null, rendered);
    });
  });
};

//
// ### function writeFiles (rendered, callback)
// #### @rendered {Object} Fully rendered site structure.
// #### @callback {function} Continuation to respond to when complete.
//
// Writes all files for the `rendered` content associated with this instance.
//
Site.prototype.writeFiles = function (rendered, callback) {
  var publicDir = path.join(this.dir, 'public'),
      written = {},
      self = this;

  function onMkdir(next) {
    return function (err) {
      return err && err.code !== 'EEXIST'
        ? next(err)
        : next();
    };
  }

  async.series([
    //
    // 1. Make `/path/to/site/public`
    //
    function mkdir(next) {
      fs.mkdir(publicDir, onMkdir(next));
    },
    //
    // 2. Write the HTML for all keys and all associated
    //    files into a matching directory structure.
    //
    function writeAll(done) {
      async.forEachSeries(
        self.targetFiles(rendered),
        function write(target, next) {
          //
          // There are three operations that take place here:
          //
          if (target.contents === 'directory') {
            //
            // 1. Create directory: `{ fullpath: /path/to/public/file.html, contents: "directory" }`
            //
            fs.mkdir(target.fullpath, onMkdir(next));
          }
          else if (target.contents) {
            //
            // 2. Write html `{ fullpath: /path/to/public/file.html, contents: "..." }`
            //
            fs.writeFile(target.fullpath, target.contents, 'utf8', next);
          }
          else if (target.source) {
            //
            // 3. Copy supporting files `{ fullpath: /path/to/public/file.html, source: "..." }`
            //
            cpr(target.source, target.fullpath, function (err) {
              return err ? next(err) : next();
            });
          }
        },
        function (err) {
          return err instanceof Error
            ? done(err)
            : done();
        }
      );
    }
  ], function (err) {
    return err ? callback(err) : callback (null, written);
  });
};

//
// ### function targetFiles (rendered)
// #### @rendered {Object} Fully rendered site structure.
//
// Returns a list of objects representing:
// 1. Directories to create in /public
// 2. Write rendered HTML content
// 3. Copy supporting files
//
Site.prototype.targetFiles = function (rendered, pathTo) {
  var contentDir = path.join(this.dir, 'content'),
      publicDir = path.join(this.dir, 'public'),
      self = this;

  pathTo = pathTo || [];

  return Object.keys(rendered).reduce(function (all, key) {
    //
    // The set of child keys under this `key` in the rendering
    // hierarchy.
    //
    var fullpath = [publicDir].concat(pathTo),
        childKeys;

    childKeys = Object.keys(rendered[key]).filter(function (childKey) {
      return childKey[0] !== '_';
    });

    if (!rendered[key]._content) {
      //
      // 1. If there is no `_content` property then this is
      //    a directory that needs creation
      //
      all = all.concat([{
        fullpath: path.join.apply(path, fullpath.concat([key])),
        contents: 'directory'
      }]);
    }
    else if (!rendered[key]._content.date
      || self.since < rendered[key]._content.date) {
      //
      // 2. If there is a `_content` property then write
      //    a file with the HTML contents.
      //
      // TODO: We should have some indicator if a page in the
      // content tree is compiled from other pages or not.
      //
      all = all.concat({
        fullpath: path.join.apply(path, fullpath.concat([key + '.html'])),
        contents: rendered[key]._content.html
      });

      //
      // 3. If this file has any supporting files then copy
      //    those as well.
      //
      if (rendered[key]._content.files) {
        all = all.concat(rendered[key]._content.files.map(function (file) {
          return {
            fullpath: path.join.apply(path, fullpath.concat([path.basename(file)])),
            source: path.join(contentDir, rendered[key].dir || '', file)
          };
        }));
      }
    }

    //
    // 4. If there are any `childKeys` then get the files that should
    //    be created from them
    //
    if (childKeys.length) {
      all = all.concat(self.targetFiles(rendered[key], pathTo.concat([key])));
    }

    return all;
  }, []);
};
