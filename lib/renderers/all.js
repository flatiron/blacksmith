/*
 * all.js: Methods for rendering a page with *all* the articles.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = require('../blacksmith'),
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
        return content[i].metadata && content[i].metadata.render === "all";
      }),
      sortedKeys = Object.keys(content).sort( function(i, j) {

        if (!content[i].metadata || !content[j].metadata) {
          if (content[i].files) {
            smith.log.warn(i+ ' does not have metadata!');
          } else {
            smith.log.warn(j+ ' does not have metadata!');
          }
          return 0;
        }

        // Sort the list in chronological order.
        var a = new Date(content[i].metadata && content[i].metadata.date),
            b = new Date(content[j].metadata && content[j].metadata.date);

        if (a && b) {
          return b - a;
        } else {
          return 0;
        }
      });

  // Function for grabbing the top x elements from the ToC
  var tocLast = function (len) {
    return $('<ul>').append($($(toc).html()).slice(0, len)).html();
  }

  pages.forEach(function (file) {
    var metadata = content[file].metadata || {},
        header;

    // Build up data. "article" is a sorted list of already-rendered articles.
    var data = {
      article: sortedKeys.map( function (i) {
        dom.innerHTML = content[i].content;

        var article = $(".content", dom).html(),
            rm = false;

        if (article) {
          // If the resource has a truthy "preview" property, replace rendered
          // articles with short versions of them, with a link to read more.
          if (content[file].metadata.preview) {
            dom.innerHTML = article;
            // Selects the first header
            header = $(":header", dom)

            // Removes elements after first header
            header.nextAll().each(function() {
              $(this).remove();
            });

            // Removes first header
            header.remove();

            return {
              content: dom.innerHTML,
              metadata: content[i].metadata,
              readMore: content[i].metadata.link
            };     
          }

          return {
            content: article,
            metadata: content[i].metadata,
            readMore: content[i].metadata.link
          };
        } else {
          return {
            content: null,
            metadata: content[i].metadata,
            readMore: content[i].metadata.link
          };
        }
      }).filter(function (e) {

        // Filter out cases where the mapping function didn't return html.
        // This can happen, for instance, if content[i].content is undefined.
        return (typeof e.content === "string");
      }).filter(function (e, i) {

        // Article limit here
        if (metadata.pageLimit) {
          return (i <= metadata.pageLimit);
        }
        else {
          return true;
        }
      }),

      toc: (metadata.toc && metadata.toc.length)
          ? tocLast(metadata.toc.length)
          : toc
    };

    // Grab the "all" theme and weld to it.
    dom.innerHTML = smith.content.theme['./all.html'].toString();

    weld(dom, data, {
      map: function (parent, element, key, val) {
        // A lot of this is shared with content.js
        // TODO: Factor into helper lib

        // Handles cases with the "date" element in the article template.
        // This includes using the "datetime" attribute.
        if ($(element).hasClass("date")) {
          var date = val ? new Date(val) : undefined;

          if (element.tagName === "DATA") {
            $(element).attr("value", date);
          }
          $(element).text(helpers.formatDate(date));

          return false;
        }

        // If there's author github metadata, link to the author's github acct.
        if ($(element).hasClass("github")) {
          if (val) {
            $(element).text("");
            $(element).append(
              $("<a>")
                .attr("href", "https://github.com/"+val)
                .text(val)
            );
          }
          return false;
        }

        // If there's author twitter metadata, link to the author's twitter acct.
        if ($(element).hasClass("twitter")) {
          if (val) {
            $(element).text("");
            $(element).append(
              $("<a>")
                .attr("href", "https://twitter.com/"+val)
                .text(val)
            );
          }
          return false;
        }

        // If there's author email metadata, attempt to modify the gravatar.
        if ($(element).hasClass('gravatar')) {
          if (val) {
            $(element).attr('src', helpers.gravatar(val, { size: 200 }));
          }
          return false;
        }

        // Populate the "read more" link
        if ($(element).hasClass('readMore')) {
          if (val) {
            $(element).attr("href",
              helpers.unresolve(smith.src, val)
            );
          }
          return false;
        }

        // In the case of markdown, we don't want to encode html entities.
        element.innerHTML = val;
        return false;
      }
    });

    smith.content.all = smith.content.all || {};

    smith.content.all[file] = {
      metadata: content[file].metadata,
      content: dom.innerHTML
    };
  });

  return dom;

};


all.generate = function(output, pages) {

  if (!pages) {
    return smith.log.info('No "all" pages to generate.');
  }

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function(file) {
    var newPath = file.replace(path.resolve(smith.src), path.resolve(smith.dst));

    newPath =  path.normalize(newPath + '/index.html');

    if (pages[file].content) {

      smith.log.info("Writing " + newPath);

      fs2.writeFile(newPath, pages[file].content, function(){});
    } else {
      smith.log.warn("No content for " + newPath);
    }
  });

  return pages;
};

all.load = function() {
  // Nothing to load.
  return;
};
