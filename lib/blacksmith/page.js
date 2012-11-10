/*
 * page.js: A single page composed to content, metadata, and partials
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

Page.prototype.renderAll = function () {
  var self = this;
  
  //
  // Clear previously rendered data.
  //
  this.rendered = {};

  if (typeof this.content[this.plural] === 'object') {
    //
    // If the `content` has a pluralized key to the page `name`,
    // then mixin the rendered page results. e.g.
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
    // Conversely if no such convention exits just set the key
    // `name` in the fully rendered page to the results. e.g.
    //
    // name = 'index'
    // content = { posts: { ... } }
    //
    this.render(this.content[name] || this.content);
  }
  
  return this.rendered;
};

Page.prototype.render = function (key, content) {
  if (arguments.length === 1) {
    content = key;
    key = null;
  }
  
  //
  // Create a map for HTML ids to use when rendering
  // this page.
  //
  var map = plates.Map(),
      rendered = {},
      fullpage;
  
  if (!this.options.content) {
    //
    // If no "content" option is set default to using a 
    // partial with the same name as this page. If not 
    // found then just use the rendered markdown HTML.
    //
    // TODO: HOW TO HANDLE INDEX MARKDOWN FILES?!?!
    //
    if (this.html.partials[this.name]) {
      rendered.content = partial.render({
        content: content._content.html,
        html: this.html.partials[this.name],
        metadata: content._content.metadata
      });
    }
    else {
      rendered.content = content._content.html;
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
    // TODO: Partial rendering
    //
  }
  
  fullpage = plates.bind(
    this.html.layouts[this.layout] || this.html.layouts['default'],
    rendered,
    map
  );
  
  //
  // Remark: HOW ARE FILES HANDLED?!?!?
  //
  if (key) {
    this.rendered[key] = fullpage;
  }
  else {
    this.rendered = fullpage;
  }
};