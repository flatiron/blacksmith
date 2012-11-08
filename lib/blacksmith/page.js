/*
 * site.js: An entire blacksmith site with layouts, sections, pages, and metadata
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    marked = require('marked'),
    utile = require('flatiron').common,
    async = utile.async;

var Page = module.exports = function Page (file, options) {
  if (!file) {
    throw new Error('File is required to render a page');
  };
  
  this.file = file;
  this.options = options || {};
};

Page.prototype.generate = function (callback) {
  //
  // Page generation workflow
  //  1. Read the file. If it is simply JSON then return the metadata 
  //  2. Parse the Markdown using `marked`
  //  3. Read all metadata into a JSON object, looking up 
  //     references as necessary (e.g. author)
  //  4. Generate HTML from Markdown
  //  5. Return Parsed Markdown, HTML, and metadata
  //
  fs.readFile(this.file, 'utf8', function (err, data) {
    //
    //  If the file is simply JSON then return the metadata 
    //
    if (path.extname(this.file) === '.json') {
      try {
        data = JSON.parse(data);
        return callback(null, { metadata: data });
      }
      catch (ex) {
        return callback(ex);
      }
    }
        
    //
    //  * Parse the Markdown using `marked`
    //  * Read all metadata into a JSON object, looking up 
    //     references as necessary (e.g. author)
    //
    // TODO: Set `marked` options.
    //
    var tokens = marked.lexer(data);
    console.dir(tokens);
    console.dir(marked.parser(tokens));
  });
};