/*
 * all.js: Methods for rendering a page with *all* the articles.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith     = require('../blacksmith'),
    weld     = require('weld').weld,
    markdown = require('github-flavored-markdown'),
    findit   = require('findit'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    path     = require('path'),
    helpers  = require('../helpers'),
    buildToc = require('../toc').buildToc;

var all = exports;

all.weld = function(dom, pages) {

  var $ = smith.window.$, // Shortcut to jquery.
      toc = smith.content.toc;

  var content = smith.content.content;

  // Sort by date.
  var data = {
    article: Object.keys(content).sort( function(i, j) {
      var a = new Date(content[i].metadata.date),
          b = new Date(content[j].metadata.date);

      if (a && b) {
        return a - b;
      } else {
        return 0;
      }
    }).filter(function (i) {
      return content[i] !== null;
    }).map( function (i) {
      dom.innerHTML = content[i].content;

      var article = $(".article", dom).html();
      if (article) {
        return article;
      } else {
        return null;
      }
    }).filter(function (e) {
      return (typeof e === "string");
    }),

    toc: smith.content.toc
  };

  dom.innerHTML = smith.content.theme['./article.html'].toString();

  weld(dom, data, {
    map: function (parent, element, key, val) {
      element.innerHTML = val;
      return false;
    }
  });

  smith.content.all = {};

  Object.keys(content).forEach(function (file) {

    var doc = content[file];

    if (doc.metadata && doc.metadata.render === "all") {
      smith.content.all[file] = {
        metadata: doc.metadata,
        content: dom.innerHTML
      };
    }
  });

  return dom;

};


all.generate = function(output, pages) {

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function(file){
    var newPath = file.replace(path.resolve(smith.src), path.resolve(smith.dst));

    newPath =  path.normalize(newPath + '/index.html');

    if (pages[file].content) {
      fs2.writeFile(newPath, pages[file].content, function(){});
    } else {
      console.log("No content for "+newPath);
    }
  });

  return pages;
};

all.load = function() {
  // Nothing to load.
  return;
};
