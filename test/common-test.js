/*
 * common-test.js: Tests for common utility functions in blacksmith.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    common = require('../lib/blacksmith/common');

var blogDir = path.join(__dirname, 'fixtures', 'blog');

vows.describe('blacksmith/common').addBatch({
  "Using the common() module": {
    "the readAll() method": {
      "with a dir of HTML files": {
        topic: function () {
          common.readAll({
            dir: path.join(blogDir, 'partials'),
            ext: '.html',
            allowEmpty: true
          }, this.callback);
        },
        "should return all HTML": function (err, data) {
          assert.isNull(err);
          assert.isObject(data);
          assert.isString(data['about-post']);
          assert.isString(data.author);
          assert.isString(data.post);
          assert.isString(data.sidebar);
        }
      },
      "with a dir of JSON files": {
        topic: function () {
          common.readAll({
            dir: path.join(blogDir, 'pages'),
            ext: '.json',
            allowEmpty: true
          }, this.callback);
        },
        "should return all JSON": function (err, data) {
          assert.isNull(err);
          assert.isObject(data);
          assert.isObject(data.index);
          assert.isObject(data.post);
        }
      },
      "with a dir of nested JSON files": {
        topic: function () {
          common.readAll({
            dir: path.join(blogDir, 'metadata'),
            ext: '.json',
            allowEmpty: true
          }, this.callback);
        },
        "should return all JSON": function (err, data) {
          assert.isNull(err);
          assert.isObject(data);
          assert.isObject(data.authors);
          assert.isObject(data.authors['charlie-robbins']);
        }
      }
    }
  }
}).export(module);