/*
 * page.js: A single page (or set of pages) composed to content, metadata, and partials
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var events = require('events'),
    fs = require('fs'),
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
  events.EventEmitter.call(this);

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
};

//
// Inherit from `events.EventEmitter`.
//
utile.inherits(Page, events.EventEmitter);

//
// ### function renderAll ()
//
// Returns all fully rendered pages associated with this instance.
//
Page.prototype.renderAll = function (source, key) {
  var rendered = {},
      self = this;

  source = source || this.content;
  key = key || this.plural;

  //
  // Helper function to determine if we should continue to traverse
  // this content tree
  //
  function hasChildren() {
    return typeof source[key] === 'object' && Object.keys(source[key]).filter(function (childKey) {
      return childKey[0] !== '_';
    }).length;
  }

  if (typeof this.options === 'object' && this.options.type === 'compile') {
    rendered[key] = {
      _content: this.render(source[key] || source[this.name] || source || this.content)
    }
  }
  else {
    if (source[key] && source[key]._content) {
      //
      // If there is content on this node then render it.
      //
      rendered._content = this.render(source[key]);
    }

    if (typeof source[key] === 'object' && hasChildren()) {
      //
      // If the `content` has a pluralized key to the page `name`,
      // render all pages in `content[plural]` e.g.:
      //
      // name = 'post'
      // content = { posts: { ... } }
      //
      rendered[key] = Object.keys(source[key]).reduce(function (rendered, nextKey) {
        if (nextKey[0] === '_') {
          return rendered;
        }

        rendered[nextKey] = self.renderAll(source[key], nextKey);
        return rendered;
      }, {});
    }
    else if (!source[key] || !source[key]._content) {
      //
      // Conversely if no such convention exists just render a single page. e.g.
      //
      // name = 'index'
      // content = { posts: { ... } }
      //
      rendered[key] = {
        _content: this.render(source[key] || source[this.name] || source || this.content)
      };
    }
  }

  return !hasChildren() && arguments.length ? rendered : rendered[key];
};

//
// ### function render (key, source)
// #### @key {string} **Optional** Key of `source` within `this.content`.
// #### @source {Object} Content to render into this page.
//
// Returns a fully rendered page for the `source` content including layout,
// partials, content and metadata.
//
Page.prototype.render = function (source) {
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
        if (typeof name !== 'string') {
          return fullHtml + self.renderContent(self.content, name);
        }

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

  return {
    html: fullpage,
    date: source._content && new Date(source._content.metadata['page-details'].date),
    dir: source._content && path.dirname(source._content.metadata['page-details'].source),
    files: source._files
  };
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
      partialName,
      plural;

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
  else if (contentOptions.tree && contentOptions.partial) {
    //
    // Otherwise render list options such as:
    //
    // "content": {
    //   "tree": "posts"
    // }
    //
    plural = inflect.pluralize(contentOptions.tree);

    return source[plural]
      ? this.renderTree(source[plural], contentOptions)
      : '';
  }
  else if (contentOptions.list) {
    //
    // Otherwise render list options such as:
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
      return rendered + self.renderList(source, utile.mixin(
        utile.clone(contentOptions),
        { name: type }
      )) + '\n';
    }, '\n');
  }
  else if (contentOptions.compile) {
    //
    // If this is a compilation of pages then compile them
    // from the `source`.
    //
    partialName = contentOptions.partial || this.name;

    if (this.html.partials[partialName]) {
      return partial.render({
        content:    source._content && source._content.content,
        metadata:   Object.keys(source).reduce(function (compiled, key) {
          compiled[key] = (source[key] && source[key]._content
            && source[key]._content.html) || '';

          return compiled;
        }, (source._content && source._content.metadata) || {}),
        html:       this.html.partials[partialName],
        remove:     this.partials[partialName] && self.partials[partialName].remove,
        references: this.references
      });
    }
    else {
      return source._content.html;
    }
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
      self = this,
      keys;

  if (typeof source[plural] !== 'object') {
    //
    // Remark: Should this just fail silently?
    //
    throw new Error('Cannot render list for ' + options.name + ': No content found');
  }

  //
  // TODO: Make sorting configurable by key and direction. For now default
  // to a descending sorting by date.
  //
  keys = Object.keys(source[plural]).sort(function (lkey, rkey) {
    var ldate = source[plural][lkey]._date,
        rdate = source[plural][rkey]._date;

    if (ldate > rdate) return -1;
    if (ldate < rdate) return 1;
    return 0;
  });

  if (options.limit) {
    keys = keys.slice(0, options.limit);
  }

  return keys.reduce(function renderOn(rendered, key) {
    var itemSource = source[plural][key];

    if (itemSource.index) {
      itemSource = itemSource.index;
    }

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

//
// ### function renderTree (source, contentOptions)
// #### @source {Object} Rendered markdown and metadata to render the tree
// #### @options {Object} Options to render this list.
//
// Attempts to render a tree of content pages by concatenating rendered
// partials.
//
Page.prototype.renderTree = function (source, options) {
  var self = this,
      tree;

  tree = Object.keys(source).reduce(function (fullTree, key) {
    fullTree[key] = Object.keys(source[key])
      .filter(function (childKey) {
        return ['_date'].indexOf(childKey) === -1;
      })
      .map(function (childKey) {
        if (childKey === '_content') {
          return source[key]._content.metadata;
        }
        else if (!source[key][childKey] || (!source[key][childKey]._content
          && !source[key][childKey].index)) {
          return;
        }
        else if (source[key][childKey]._content) {
          return source[key][childKey]._content.metadata;
        }
        else if (source[key][childKey].index) {
          return source[key][childKey].index._content &&
            source[key][childKey].index._content.metadata;
        }
      })
      .filter(Boolean);

    return fullTree;
  }, {});

  //
  // Helper function which sorts sub-keys based on
  // metadata `source` values.
  //
  function sortMetadata(lval, rval) {
    var ldetails = lval['page-details'],
        rdetails = rval['page-details'];

    if (/^index/.test(path.basename(ldetails.source))) {
      return -1;
    }

    if (/^index/.test(path.basename(rdetails.source))) {
      return 1;
    }

    if (ldetails.title > rdetails.title) return 1;
    if (ldetails.title < rdetails.title) return -1;
    return 0;
  }

  return Object.keys(tree).sort(function (lval, rval) {
    var lindex, rindex;

    if (options.sort) {
      lindex = options.sort.indexOf(lval);
      rindex = options.sort.indexOf(rval);

      if (lindex > rindex) return 1;
      if (lindex < rindex) return -1;
    }

    if (lval > rval) return 1;
    if (lval < rval) return -1;

    return 0;
  }).reduce(function (rendered, key) {
    return rendered + partial.render({
      metadata:   {
        tree: tree[key].sort(sortMetadata)
      },
      html:       self.html.partials[options.partial],
      remove:     self.partials[options.partial] && self.partials[options.partial].remove,
      references: self.references
    });
  }, '');
};