/*
 * site-test.js: Tests for site generation pages
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    Site = require('../lib/blacksmith/site');

var blogDir = path.join(__dirname, 'fixtures', 'blog');

vows.describe('blacksmith/site').addBatch({
  "An instance of a site": {
    topic: new Site(blogDir),
    "the load() method": {
      topic: function (site) {
        site.load(this.callback);
      },
      "should load execute without an error": function (err, meta) {
        assert.isNull(err);
        assert.isObject(meta);
      },
      "should load all metadata": function (err, meta) {
        var options = meta.options;
        
        assert.isObject(options);
        assert.equal(options.dir, blogDir);
        assert.equal(options.layout, 'default');
        
        //
        // TODO: Test page contents
        //
        assert.isObject(options.pages);
        assert.isObject(options.pages.post);
        assert.isObject(options.pages.archive);
        assert.isObject(options.pages.index);
      },
      "should load all html": function (err, meta) {
        var html = meta.html;
        
        //
        // TODO: Test HTML contents
        //
        assert.isObject(html.layouts);
        assert.isString(html.layouts.default);
        assert.isObject(html.partials);
        assert.isString(html.partials.sidebar);
        assert.isString(html.partials.post);
      }
    },
    "the renderContent() method": {
      topic: function (site) {
        site.renderContent(path.join(blogDir, 'content'), this.callback);
      },
      "should respond with all rendered markdown": function (err, content) {
        assert.isNull(err);
        assert.isObject(content);
      }
    }
  }
}).export(module);