/*
 * partial-test.js: Tests for rendering partials.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    partial = require('../lib/blacksmith/partial');

var fixturesDir = path.join(__dirname, 'fixtures'),
    blogDir = path.join(fixturesDir, 'blog'),
    renderedDir = path.join(fixturesDir, 'rendered', 'partials'),
    partialsDir = path.join(blogDir, 'partials'),
    partials,
    rendered;

//
// Read all the partials for later use
//
partials = {
  'about-post': fs.readFileSync(path.join(partialsDir, 'about-post.html'), 'utf8')
};

rendered = {
  'about-post': fs.readFileSync(path.join(renderedDir, 'about-post.html'), 'utf8')
                  .replace('today', new Date().toLocaleDateString())
};

vows.describe('blacksmith/partial').addBatch({
  "Using the partial module": {
    "the render() method": {
      "a partial": {
        "with simple metadata": {
          topic: function () {
            return partial.render({
              html: partials['about-post'],
              metadata: {
                'page-details': {
                  date: new Date().toLocaleDateString(),
                  href: '/a-post',
                  files: {
                    js: [
                      {
                        filename: 'file1.js',
                        url: '/a-post/file1.js'
                      },
                      {
                        filename: 'file2.js',
                        url: '/a-post/file2.js'
                      }
                    ]
                  }
                }
              }
            });
          },
          "should render correctly": function (result) {
            assert.isString(result);
            assert.equal(rendered['about-post'], result);
          }
        },
        "with complex metadata": {
          //
          // Remark: What is "nested metadata"
          //
        },
        "with nested partials": {
          //
          // TODO: Write this feature!!!
          //
        },
        "with metadata references": {
          //
          // TODO: Write this feature!!!
          //
        }
      }
    }
  }
}).export(module);