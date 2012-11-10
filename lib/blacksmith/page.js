/*
 * page.js: A single page (or set of pages) composed to content, metadata, and partials
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    plates = require('plates'),
    utile = require('flatiron').common,
    async = utile.async,
    inflect = utile.inflect,
    partial = require('./partial');

//
// ### function Page (options)
// #### @options {Object} Options for this Page.
//
// Constructor function for the Page object representing
// a single page (or set of pages).
//
var Page = module.exports = function Page(options) {
  //
  // Set all options for this instance
  //
  // TODO: Require all of this!
  //
  this.name    = options.name;
  this.plural  = inflect.pluralize(this.name)
  this.dir     = options.dir;
  this.layout  = options.layout || 'default';
  this.options = options.options;
  
  //
  // Represents all HTML and partially rendered content 
  // associate with the site.
  //
  this.html     = options.html;
  this.content  = options.content;
  this.rendered = {};
};

//
// ### function renderAll ()
//
// Returns all fully rendered pages associated with this instance. 
//
Page.prototype.renderAll = function () {
  var self = this;
  
  //
  // Clear previously rendered data.
  //
  this.rendered = {};

  if (typeof this.content[this.plural] === 'object') {
    //
    // If the `content` has a pluralized key to the page `name`,
    // render all pages in `content[plural]` e.g.:
    //
    // name = 'post'
    // content = { posts: { ... } }
    //
    Object.keys(this.content[this.plural]).forEach(function renderOne(key) {
      self.render(key, self.content[self.plural][key]);
    });
  }
  else {
    //
    // Conversely if no such convention exists just render a single page. e.g.
    //
    // name = 'index'
    // content = { posts: { ... } }
    //
    this.render(this.content[name] || this.content);
  }
  
  return this.rendered;
};

//
// ### function render (key, source)
// #### @key {string} **Optional** Key of `source` within `this.content`.
// #### @source {Object} Content to render into this page.
//
// Returns a fully rendered page for the `source` content including layout,
// partials, content and metadata.
//
Page.prototype.render = function (key, source) {
  if (arguments.length === 1) {
    source = key;
    key = null;
  }
  
  //
  // Create a map for HTML ids to use when rendering
  // this page.
  //
  var map = plates.Map(),
      rendered = {},
      fullpage;
  
  if (!this.options.content || typeof this.options.content === 'string') {
    //
    // If no "content" option (or if it is a string) is set default to using a 
    // partial with the same name as this page. If it is a string assume it 
    // is the name of a partial. If not found then just use the rendered
    // markdown HTML.
    //
    if (this.html.partials[this.options.content || this.name]) {
      rendered.content = partial.render({
        content: source._content.html,
        html: this.html.partials[this.name],
        metadata: source._content.metadata
      });
    }
    else {
      rendered.content = source._content.html;
    }
  }
  else {
    
    //
    // Otherwise render most complex options such as:
    //
    // "content": {
    //   "list": "posts",
    //   "truncate": true,
    //   "limit": 20
    // }
    //
    // TODO: IMPLEMENT THIS!!!
    //
  }
  
  if (this.options.partials) {
    //
    // TODO: Additional partial rendering
    //
  }
  
  fullpage = plates.bind(
    this.html.layouts[this.layout] || this.html.layouts['default'],
    rendered,
    map
  );
  
  if (key) {
    this.rendered[key] = {
      html: fullpage,
      files: source._files
    };
  }
  else {
    this.rendered = { 
      html: fullpage,
      files: source._files
    }
  }
};