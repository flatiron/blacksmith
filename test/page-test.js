/*
 * page-test.js: Tests for rendering pages.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    utile = require('flatiron').common,
    async = utile.async,
    vows = require('vows'),
    common = require('../lib/blacksmith/common'),
    Page = require('../lib/blacksmith/Page'),
    Site = require('../lib/blacksmith/Site');

var blogDir = path.join(__dirname, 'fixtures', 'blog');

vows.describe('blacksmith/page').addBatch({
  "An instance of a Page": {
    topic: function () {
      var site = new Site(blogDir),
          self = this;

      async.waterfall([
        //
        // 1. Load all HTML and metadata.
        //
        function loadSite(next) {
          site.load(function (err) {
            return err ? next(err) : next();
          });
        },
        //
        // 2. Render all content in `/content`.
        //
        function renderContent(next) {
          site.renderContent(path.join(site.dir, 'content'), next);
        }
      ], function (err, content) {
        return err ? self.callback(err) : self.callback(null, site, content);
      })

    },
    "that renders multiple files": {
      topic: function (site, content) {
        var page = new Page({
          name:    'post',
          dir:     site.dir,
          options: site.pages.post,
          html:    site.html,
          content: content
        });

        return page.renderAll();
      },
      "should respond with the fully rendered pages": function (rendered) {
        assert.isObject(rendered);

        ['a-post', 'another-post'].forEach(function (file) {
          assert.isObject(rendered[file]);
          assert.isObject(rendered[file]._content);
          assert.isString(rendered[file]._content.html);
        });

        assert.isObject(rendered['dir-post'].index._content);
        assert.isString(rendered['dir-post'].index._content.html);
        assert.deepEqual(rendered['dir-post'].index._content.files, ['file1.js', 'file2.js']);
      }
    },
    "that renders compilation pages (like index)": {
      topic: function (site, content) {
        var page = new Page({
          name:    'index',
          dir:     site.dir,
          options: site.pages.index,
          html:    site.html,
          content: content
        });

        return page.renderAll();
      },
      "should respond with the fully rendered pages": function (rendered) {
        assert.isObject(rendered);
        assert.isObject(rendered._content);
        assert.isString(rendered._content.html);
      }
    }
  }
}).export(module);