/*
 * content.js: Core markdown content included on any individual page.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    marked = require('marked'),
    utile = require('flatiron').common,
    async = utile.async,
    common = require('./common');

var matchers = {
  truncate: /\#{2}\!{2}truncate\s*[\n]?/,
  linkdef: /^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/
};

//
// ### function render (options, callback)
// #### @options {string|Object} Options for rendering this markdown.
// ####   @options.source {string} Markdown file to render.
// ####   @options.files  {Array}  **Optional** List of files to use in content snippets.
// ####   @options.dir    {string} **Optional** Directory the source and files are within.
// ####   @options.marked {Object} **Optional** Options to pass to `marked`.
//        Defaults to `common.marked`.
// #### @callback {function} Continuation to respond to when complete.
//
// Renders an individual Markdown file with the specified `options`.
//
exports.render = function (options, callback) {
  if (typeof options === 'string') {
    options = { source: options };
  }

  var ext = path.extname(options.source);

  if (ext !== '.md' && ext !== '.markdown') {
    return callback(new Error('Invalid content extention: ' + ext));
  }

  //
  // Merge in default `marked` options.
  //
  options.marked = utile.mixin(options.marked || {}, common.marked);

  //
  // Content generation workflow
  //  1. Read the file.
  //  2. Replace all content snippets with file contents.
  //  3. Parse the Markdown using `marked`
  //  4. Read all metadata into a JSON object
  //  5. Generate HTML from Markdown
  //  6. Return HTML and metadata
  //
  async.waterfall([
    //
    //  1. Read the file.
    //
    async.apply(fs.readFile, options.source, 'utf8'),
    //
    //  2. Replace all content snippets with file contents.
    //
    function addSnippets(data, next) {
      if (!options.files || !Array.isArray(options.files) || !options.files.length) {
        return next(null, data);
      }

      exports.addSnippets({
        files: options.files,
        dir: options.dir,
        source: data
      }, next);
    },
    //
    //  3. Parse the Markdown using `marked`
    //  4. Read all metadata into a JSON object
    //  5. Generate HTML from Markdown
    //
    function renderMarkdown(source, next) {
      var truncated = exports.truncate(source),
          metadata = {},
          capture,
          tokens,
          html;


      try {
        //
        // Remove the truncation marker
        //
        source = source.replace(matchers.truncate, '');

        //
        // Parse the Markdown using `marked`
        //
        if (options.marked) {
          marked.setOptions(options.marked);
        }

        tokens = marked.lexer(source);

        //
        // Read all metadata into a JSON object
        //
        // Remark: A bit of a markdown hack here using link definitions
        // as a storage mechanism for metadata. We should explore expanding
        // the markdown definition to include metadata so we don't have to use:
        //
        //    [meta:key] <> (Metadata value)
        //    [meta:nested:key] <> (Metadata value)
        //
        function insertKey(path, value) {
          var target = metadata,
              key;

          //
          // Scope into the object to get the appropriate nested context
          //
          while (path.length > 1) {
            key = path.shift();
            if (!target[key] || typeof target[key] !== 'object') {
              target[key] = {};
            }

            target = target[key];
          }

          // Set the specified value in the nested JSON structure
          key = path.shift();
          target[key] = value;
        }

        if (tokens && typeof tokens.links === 'object') {
          Object.keys(tokens.links).forEach(function (key) {
            if (capture = /^meta\:(.*)/.exec(key)) {
              insertKey(capture[1].split(':'), tokens.links[key].title);
            }
          });
        }

        //
        // Generate HTML from Markdown
        //
        html = marked.parser(tokens);

        //
        // Return HTML and metadata
        //
        next(null, {
          markdown: source,
          html: html,
          metadata: metadata,
          truncated: truncated
        });
      }
      catch (ex) {
        next(ex);
      }
    }
  ], function (err, results) {
    //
    //  6. Return HTML and metadata
    //
    return err ? callback(err) : callback(null, results);
  });
};

//
// ### function addSnippets (options, callback)
// #### @options {string|Object} Options for rendering this markdown.
// ####   @options.source {string} Markdown source to add snippets to.
// ####   @options.files  {Array}  **Optional** List of files to use in content snippets.
// ####   @options.dir    {string} **Optional** Directory the source and files are within.
// #### @callback {function} Continuation to respond to when complete.
//
// Replaces all references to snippets with each file content wrapped with ```.
//
exports.addSnippets = function (options, callback) {
  var source = options.source;

  //
  // ### function addSnippet
  // Attempts to add the snippet for the given `file`.
  //
  function addSnippet(file, done) {
    var fullpath = path.join(options.dir, file),
        gfmExt = path.extname(file).slice(1);

    async.waterfall([
      //
      // 1. Ensure the snippet is valid.
      //
      async.apply(common.isValidSnippet, fullpath),
      //
      // 2. Read the file contents
      //
      async.apply(fs.readFile, fullpath, 'utf8'),
      //
      // 3. Attempt to replace the file contents in
      //    the source itself.
      //
      function replace(data, next) {
        source = source.replace(new RegExp('<\\s*' + file + '\\s*>'), [
          '``` ' + gfmExt,
          data,
          '```'
        ].join('\n'));

        next();
      }
    ], done);
  }

  //
  // Iterate over all files with a concurrency of 10. Ignore:
  //
  // * All image files
  // * All files greater than 1MB
  //
  async.forEachLimit(options.files, 100, addSnippet, function (err) {
    return err ? callback(err) : callback(null, source);
  });
};

//
// ### function truncate (source)
// #### @source {string} Source markdown to truncate
//
// Truncates the specified markdown `source`, ensuring that
// all link definitions are included for rendering.
//
exports.truncate = function (source) {
  var truncated = {},
      parts,
      rest;

  if (!matchers.truncate.test(source)) {
    return truncated;
  }

  //
  // Split the markdown on the truncate token.
  //
  parts = source.split(matchers.truncate);
  truncated.markdown = parts[0];
  rest = parts[1];

  //
  // Iterate over the non-truncated markdown and
  // extract all link definitions.
  //
  rest.split('\n').forEach(function (line) {
    var match;
    if (match = matchers.linkdef.exec(line)) {
      truncated.markdown += ('\n' + line);
    }
  });

  truncated.html = marked(truncated.markdown);
  return truncated;
};