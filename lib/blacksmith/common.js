/*
 * common.js: Common utility functions for blacksmith
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    hljs = require('highlight.js'),
    utile = require('flatiron').common,
    async = utile.async;

var common = exports;

//
// Whitelist extensions for various rendering components
//
common.extensions = {
  snippets: [
    '',        '.as',   '.asp',  '.c',   '.clj',     '.coffee', '.cs',
    '.cpp',    '.d',    '.dart', '.erl', '.example', '.f90',    '.go',
    '.groovy', '.h',    '.in',   '.ini', '.java',    '.j',      '.jl',
    '.js',     '.json', '.lisp', '.lua', '.ml',      '.perl',   '.php',
    '.pl',     '.ps1',  '.py',   '.r',   '.rb',      '.scala',  '.settings',
    '.sh',     '.ss',   '.st',   '.txt', '.vb',      '.xml',    '.yaml'
  ]
};

//
// Available highlight languages
//
common.availableLanguages = Object.keys(hljs.LANGUAGES);
common.availableLanguages.push('js');
common.availableLanguages.push('md');
//
// Default settings for `marked`.
// TODO: Make this configurable.
//
hljs.LANGUAGES.js = hljs.LANGUAGES.javascript;
hljs.LANGUAGES.md = hljs.LANGUAGES.markdown;

common.marked = {
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: function(code, lang) {
    if(code && ~common.availableLanguages.indexOf(lang)) {
      return hljs.highlight(lang, code).value;
    }
    else {
      return code;
    }
  }
};

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

    var results = {};

    //
    // Read all files asynchronously parsing JSON if necessary
    //
    async.forEachLimit(
      files, 100,
      function readFile(file, next) {
        var fullpath = path.join(options.dir, file);

        fs.stat(fullpath, function (err, stats) {
          if (err) {
            return next(err);
          }

          if (stats.isDirectory()) {
            //
            // If it is a directory then recursively read all
            // files within it.
            //
            return common.readAll({
              dir: fullpath,
              ext: options.ext,
              allowEmpty: options.allowEmpty
            }, function (err, data) {
              if (err) {
                return next(err);
              }

              results[path.basename(file, options.ext)] = data;
              next();
            });
          }
          else if (path.extname(file) === options.ext) {
            //
            // Otherwise if it matches our target file extention
            // just read the file itself.
            //
            return fs.readFile(fullpath, 'utf8', function (err, data) {
              if (err) {
                return next(err);
              }

              if (options.ext === '.json') {
                try {
                  data = JSON.parse(data);
                }
                catch (ex) {
                  return next(ex);
                }
              }

              results[path.basename(file, options.ext)] = data;
              next();
            });
          }

          next();
        });
      },
      function (err) {
        return err ? callback(err) : callback(null, results);
      }
    );
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
    // 2. Read all HTML: layouts, and partials
    //
    html: async.apply(
      async.parallel,
      {
        layouts: async.apply(
          common.readAll,
          {
            dir: path.join(dir, 'layouts'),
            ext: '.html',
            allowEmpty: false
          }
        ),
        partials: async.apply(
          common.readAll,
          {
            dir: path.join(dir, 'partials'),
            ext: '.html',
            allowEmpty: true
          }
        )
      }
    ),
    //
    // 3. Read all metadata references.
    //
    references: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'metadata'),
        ext: '.json',
        allowEmpty: true
      }
    ),
    //
    // 4. Read all layouts.
    //
    layouts: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'layouts'),
        ext: '.json',
        allowEmpty: true
      }
    ),
    //
    // 5. Read all partials.
    //
    partials: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'partials'),
        ext: '.json',
        allowEmpty: true
      }
    ),
    //
    // 6. Read all pages.
    //
    pages: async.apply(
      common.readAll,
      {
        dir: path.join(dir, 'pages'),
        ext: '.json',
        allowEmpty: true
      }
    )
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
  content.metadata                        = content.metadata || {};
  content.metadata['page-details']        = content.metadata['page-details'] || {};
  content.metadata['page-details'].date   = new Date(content.metadata.date || options.stats.ctime).toLocaleDateString();
  content.metadata['page-details'].href   = href.replace(path.extname(href), '');
  content.metadata['page-details'].source = options.fullpath.replace(options.dir, '');
  content.metadata['page-details'].title  = content.metadata['page-details'].title
    || content.metadata.title
    || content.metadata['page-details'].href.slice(1);

  //
  // Remove hoisted metadata to avoid duplicates
  //
  ['title', 'date'].forEach(function (key) {
    if (content.metadata[key]) {
      delete content.metadata[key];
    }
  });

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
};

//
// ### function isValidSnippet (options, callback)
// #### @fullpath {string} Full path of the snippet to validate.
// #### @callback {function} Continuation to respond to when complete.
//
// Responds with a value indicating if the snippet is valid for
// rendering within a piece of content.
//
common.isValidSnippet = function (fullpath, callback) {
  var ext = path.extname(fullpath).toLowerCase(),
      file = path.basename(fullpath, ext);

  //
  // If the file doesnt have a whitelisted extension
  // or it is a dotfile then it is not valid.
  //
  if (common.extensions.snippets.indexOf(ext) === -1
    || file[0] === '.') {
    return callback(null, false);
  }

  fs.stat(fullpath, function (err, stats) {
    return err ? callback(err) : callback(null, stats.size < (1024 * 1024));
  });
};