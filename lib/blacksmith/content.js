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
    async = utile.async;

//
// ### function render (options, callback)
// #### @options {string|Object} Options for rendering this markdown.
// ####   @options.file {string} Markdown file to render.
// ####   @options.marked {Object} **Optional** Options to pass to `marked`.
// #### @callback {function} Continuation to respond to when complete.
// 
// Renders an individual Markdown file with the specified `options`.
//
exports.render = function (options, callback) {
  if (typeof options === 'string') {
    options = { file: options };
  }
  
  var ext = path.extname(options.file) 
  
  if (ext !== '.md' && ext !== '.markdown') {
    return callback(new Error('Invalid content extention: ' + ext));
  }
  
  //
  // Content generation workflow
  //  1. Read the file. 
  //  2. Parse the Markdown using `marked`
  //  3. Read all metadata into a JSON object
  //  4. Generate HTML from Markdown
  //  5. Return HTML and metadata
  //
  fs.readFile(options.file, 'utf8', function (err, data) {
    var metadata = {},
        capture,
        tokens,
        html;
    
    if (options.truncate) {
      //
      // TODO: Split the markdown at `## `
      //
    }
    
    try {
      //
      // Parse the Markdown using `marked`
      //
      if (options.marked) {
        marked.setOptions(options.marked);
      }
      
      tokens = marked.lexer(data);
      
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
      callback(null, {
        markdown: data,
        html: html,
        metadata: metadata
      });
    }
    catch (ex) {
      return callback(ex);
    }
  });
};

exports.addSnippets = function (options, callback) {
  
};