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
      "should load all rendering information": function (err, meta) {
        assert.equal(meta.dir, blogDir);
        assert.equal(meta.layout, 'default');

        //
        // TODO: Test page contents
        //
        assert.isObject(meta.pages);
        assert.isObject(meta.pages.post);
        assert.isObject(meta.pages.archive);
        assert.isObject(meta.pages.index);
        assert.isObject(meta.partials);
        assert.isObject(meta.partials['about-post']);
        assert.isObject(meta.partials.author);
        assert.isObject(meta.partials.post);
      },
      "should load all metadata references": function (err, meta) {
        var references = meta.references;

        assert.isObject(references);
        assert.isObject(references.authors);
        assert.isObject(references.authors['charlie-robbins']);
      },
      "should load all html": function (err, meta) {
        var html = meta.html;

        //
        // TODO: Test HTML contents
        //
        assert.isObject(html.layouts);
        assert.isString(html.layouts.default);
        assert.isObject(html.partials);
        assert.isString(html.partials['about-post']);
        assert.isString(html.partials.author);
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
  },
  "Another instance of a site": {
    topic: new Site(blogDir),
    "the render() method": {
      topic: function (site) {
        //
        // Remark: We should clean out everything before rendering.
        //
        site.render(this.callback);
      },
      "should render all content for the site": function (err, written) {
        //
        // TODO: Assert these tests.
        //
      }
    }
  }
}).export(module);