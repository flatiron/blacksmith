/*
 * all.js: Methods for rendering a page with *all* the articles.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith     = require('../blacksmith'),
    weld     = require('weld').weld,
    fs       = require('fs'),
    fs2      = require('../fs2'),
    path     = require('path'),
    helpers  = require('../helpers');

var all = exports;

all.weld = function(dom, pages) {

  var $ = smith.window.$, // Shortcut to jquery.
      toc = smith.content.toc,
      content = smith.content.content,
      pages = Object.keys(content).filter(function (i) {
        return content[i].metadata.render === "all";
      });

  pages.forEach(function (file) {

    // Build up data. "article" is a sorted list of already-rendered articles.
    var data = {
      article: Object.keys(content).sort( function(i, j) {

        // Sort the list in chronological order.
        var a = new Date(content[i].metadata.date),
            b = new Date(content[j].metadata.date);

        if (a && b) {
          return a - b;
        } else {
          return 0;
        }
      }).map( function (i) {
        dom.innerHTML = content[i].content;

        var article = $(".article", dom).html(),
            rm = false;

        if (article) {
          // If the resource has a truthy "preview" property, replace rendered
          // articles with short versions of them, with a link to read more.
          if (content[file].metadata.preview) {
            dom.innerHTML = article;
            // Selects all elements after *first* h2
            $("h2 ~ *", dom).nextAll().each(function() {
              // At the first h2, start removing elements.
              if (this.tagName == "H2") {
                rm = true;
              }

              // Remove elements
              if (rm) {
                $(this).remove();
              }

            });

            // Append a "read more" link
            $(".content", dom).append(
              $("<h3>").append(
                $("<a>").attr("href",
                  helpers.unresolve(smith.src, content[i].metadata.link)
                ).text("Read more...")
              )
            ).append($("<hr>").attr("class", "divider"));

            return dom.innerHTML;
     
          }

          return article;
        } else {
          return null;
        }
      }).filter(function (e) {

        // Filter out cases where the mapping function didn't return html.
        // This can happen, for instance, if content[i].content is undefined.
        return (typeof e === "string");
      }),

      toc: smith.content.toc
    };

    // Grab the "article" theme and weld to it.
    dom.innerHTML = smith.content.theme['./article.html'].toString();

    weld(dom, data, {
      map: function (parent, element, key, val) {
        element.innerHTML = val;
        return false;
      }
    });

    smith.content.all = {};

    var doc = content[file];

    smith.content.all[file] = {
      metadata: doc.metadata,
      content: dom.innerHTML
    };
  });

  return dom;

};


all.generate = function(output, pages) {

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function(file) {
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
