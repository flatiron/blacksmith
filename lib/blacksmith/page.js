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
  this.partials   = options.partials || {};
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
  var rendered = { content: this.renderContent(source) },
      map = plates.Map(),
      self = this,
      fullpage;
  
  //
  // Render all partials associated with this page.
  //
  if (this.options.partials) {
    Object.keys(this.options.partials).forEach(function (id) {
      //
      // Always default to the partials being an Array.
      //
      self.options.partials[id] = !Array.isArray(self.options.partials[id])
        ? [self.options.partials[id]]
        : self.options.partials[id];
      
      rendered[id] = self.options.partials[id].reduce(function (fullHtml, name) {
        return fullHtml + partial.render({
          metadata:   source._content.metadata,
          html:       self.html.partials[name],
          remove:     self.partials[name] && self.partials[name].remove,
          references: self.references          
        }) + '\n';
      }, '\n');
    });
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
  if (!contentOptions) {
    contentOptions = this.options.content;
  }
  
  var self = this,
      partialName;
  
  if (!contentOptions || typeof contentOptions === 'string') {
    //
    // If no "content" option (or if it is a string) is set default to using a 
    // partial with the same name as this page. If it is a string assume it 
    // is the name of a partial. If not found then just use the rendered
    // markdown HTML.
    //
    partialName = contentOptions || this.options.partial || this.name;
    
    if (this.html.partials[partialName]) {
      return partial.render({
        content:    source._content.html,
        metadata:   source._content.metadata,
        html:       this.html.partials[partialName],
        remove:     this.partials[partialName] && self.partials[partialName].remove,
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
    var itemSource = source[plural][key];
    
    if (options.truncate) {
      //
      // If we should truncate posts then do so by passing
      // the HTML rendered from the truncated markdown.
      //
      itemSource = {
        _files: itemSource._files,
        _content: {
          metadata: itemSource._content.metadata,
          html: itemSource._content.truncated.html
            ? itemSource._content.truncated.html
            : itemSource._content.html
        }
      };
    }
    
    return rendered + self.renderContent(itemSource, options.partial || options.name) + '\n';
  }, '\n');
};