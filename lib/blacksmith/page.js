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
    content = require('./content'),
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
  this.plural  = inflect.pluralize(this.name);
  this.dir     = options.dir;
  this.layout  = options.layout || 'default';
  this.options = options.options;
  
  //
  // Represents all HTML and partially rendered content 
  // associate with the site.
  //
  this.html       = options.html;
  this.content    = options.content;
  this.references = options.references;
  this.rendered   = {};
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
    this.render(this.content[this.name] || this.content);
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
      rendered = { content: this.renderContent(source) },
      fullpage;
  
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
      dir: path.dirname(source._content.metadata['page-details'].source),
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

//
// ### function renderContent (source, contentOptions)
// #### @source {Object} Rendered markdown and metadata to render on the page
// #### @contentOptions {Object} Options to render this content
//
// Attempts to render the content section of a single page composed of:
//
// 1. A single content file
// 2. The composition of multiple content files.
//
Page.prototype.renderContent = function (source, contentOptions) {
  var self = this;
  
  if (!contentOptions) {
    contentOptions = this.options.content;
  }
  
  if (!contentOptions || typeof contentOptions === 'string') {
    //
    // If no "content" option (or if it is a string) is set default to using a 
    // partial with the same name as this page. If it is a string assume it 
    // is the name of a partial. If not found then just use the rendered
    // markdown HTML.
    //
    if (this.html.partials[contentOptions || this.name]) {
      return partial.render({
        content: source._content.html,
        html: this.html.partials[contentOptions || this.name],
        metadata: source._content.metadata,
        references: this.references
      });
    }
    else {
      return source._content.html;
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
    // If no "list" property is defined then throw an error.
    // Remark: What are other kinds of content rendering are their?
    //
    
    //
    // Always attempt to render multiple lists of content
    //
    contentOptions.list = !Array.isArray(contentOptions.list)
      ? [contentOptions.list]
      : contentOptions.list;
    
    return contentOptions.list.reduce(function (rendered, type) {
      //
      // TODO: Implement "truncate" and "limit" options.
      //
      return rendered + self.renderList(source, utile.mixin(
        utile.clone(contentOptions),
        { name: type }
      )) + '\n';
    }, '\n');
  }
};

//
// ### function renderList (source, contentOptions)
// #### @source {Object} Rendered markdown and metadata to render the list
// #### @options {Object} Options to render this list.
//
// Attempts to render a list of content pages by concatenating rendered
// partials.
//
Page.prototype.renderList = function (source, options) {
  var plural = inflect.pluralize(options.name),
      self = this;
  
  if (typeof source[plural] !== 'object') {
    //
    // Remark: Should this just fail silently?
    //
    throw new Error('Cannot render list for ' + options.name + ': No content found');
  }
  
  return Object.keys(source[plural]).reduce(function renderOn(rendered, key) {
    return rendered + self.renderContent(source[plural][key], options.name) + '\n';
  }, '\n');
};