/*
 * archive.js: Methods for rendering a page with a listing of articles.
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

var archive = exports;

archive.weld = function(dom, pages) {

  var $ = smith.window.$, // Shortcut to jquery.
      toc = smith.content.toc,
      content = smith.content.content,
      pages = Object.keys(content).filter(function (i) {
        var isArchive = (content[i].metadata
          && content[i].metadata.render === "archive");

        if (isArchive) {
          smith.log.silly('Rendering an archive page for '+i);
        }

        return isArchive;
      }),
      sortedKeys = Object.keys(content).filter(function (i) {
        return content[i].metadata
          && (content[i].metadata.index !== false)
      }).sort( function(i, j) {

        if (!content[i].metadata || !content[j].metadata) {
          if (content[i].files) {
            smith.log.warn(i+ ' does not have metadata!');
          } else {
            smith.log.warn(j+ ' does not have metadata!');
          }
          return 0;
        }

        // Sort the list in chronological order.
        var a = new Date(content[i].metadata && content[i].metadata.date) || 0,
            b = new Date(content[j].metadata && content[j].metadata.date) || 0;

        if (a && b) {
          return b - a;
        } else {
          return 0;
        }
      });

  // Function for grabbing the top x elements from the ToC
  var tocLast = function (len) {
    return $('<ul>').append($($(toc).html()).slice(0, len))[0].outerHTML;
  }

  pages.forEach(function (file) {
    var metadata = content[file].metadata || {},
        header;

    // Build up data. "article" is a sorted list of already-rendered articles.
    var data = {
      article: sortedKeys.map( function (i) {
        try {
          dom.innerHTML = content[i].content;
        } catch (err) {
          smith.log.error('Error while loading content for archive from '+i);
          throw err;
        }

        //Uses the title which is inside the article tag
        //do not confuse with the blog title
        var article = $(".content", dom).html(),
            title = $("article > .title", dom).html(),
            rm = false;

        // As with the article, we've already "rendered" the title (with link),
        // so let's set that here.
        content[i].metadata.title = title;

        if (article) {
          // If the resource has a truthy "preview" property, replace rendered
          // articles with short versions of them, with a link to read more.
          if (content[file].metadata.preview) {
            dom.innerHTML = article;
            [
              'h2'
            ].forEach(function (selector) {
              elem = $(selector, dom);

              // Removes elements after selected element
              elem.nextAll().each(function() {
                $(this).remove();
              });

              // Removes selected element
              elem.remove();
            });

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

    // Grab the "archive" theme and weld to it.
    dom.innerHTML = (function () {
      if (metadata.theme) {
        smith.log.silly('Using theme '+path.resolve('./theme/'+metadata.theme)
          + ' for ' + file
        );
        return smith.content.theme[metadata.theme];
      }
      else {
        smith.log.silly('Using theme '+path.resolve('./theme/archive.html')
          + ' for ' + file
        );
        return smith.content.theme['./archive.html'];
      }
    })();

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

        // Populate the "read more" link
        if ($(element).hasClass('title')) {
          element.innerHTML = val;

          return false;
        }

        // In other cases, we don't want to encode html entities.
        element.innerHTML = val;
        return false;
      }
    });

    // Add some meta tags. These are populated from a global config as well as
    // content metadata.
    $('meta[name=keywords]', dom).attr('content',
      (smith.config.get("tags") || []).join(',')
    );

    smith.content.archive = smith.content.archive || {};

    smith.content.archive[file] = {
      metadata: content[file].metadata,
      content: dom.innerHTML
    };
  });

  return dom;

};


archive.generate = function(output, pages) {

  if (!pages) {
    return smith.log.info('No "archive" pages to generate.');
  }

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function(file) {
    var newPath = file.replace(path.resolve(smith.src), path.resolve(smith.dst)),
        content = pages[file].content;

    newPath =  path.normalize(newPath + '/index.html');

    if (content) {

      smith.log.debug("Writing " + newPath);

      if (typeof content !== 'string' && !Buffer.isBuffer(content)) {
        smith.log.warn('Content from '+file+' is of type '+(typeof content));
      }

      fs2.writeFile(newPath, pages[file].content, function (err) {
        if (err) {
          smith.log.error('Error while writing '+newPath+' to disk:');
          throw err;
        }
      });
    } else {
      smith.log.warn("No content for " + newPath);
    }
  });

  return pages;
};
