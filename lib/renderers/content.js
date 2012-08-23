/*
 * content.js: Methods for generating "content" pages, such as blog posts and
 * articles. Also handles directory views if there is no content.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var findit   = require('findit'), 
    path     = require('path'),
    hl       = require('../../vendor/highlight/lib/highlight').Highlight,
    marked   = require('marked'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    smith    = require('../blacksmith'),
    weld     = require('weld').weld,
    util     = require('util'),
    buildToc = require('../toc').buildToc,
    helpers  = require('../helpers');

var content = exports;


content.weld = function(dom, pages) {

  // Shortcut to jquery
  var $ = smith.window.$;

  // Shortcut to generated table of contents.
  var toc = smith.content.toc;

  // Function for grabbing the top x elements from the ToC
  var tocLast = function (len) {
    return $('<ul>').append($($(toc).html()).slice(0, len))[0].outerHTML;
  };

  Object.keys(pages).forEach( function (i) {

    smith.log.silly('Rendering content page ' + i);

    var metadata = pages[i].metadata || {},
        ls = pages[i].ls || [],
        pwd = helpers.unresolve(smith.src, i),
        md,
        byThisAuthor,
        data;

    // If a page has a specified renderer that isn't handled by "content",
    // return early to short-circuit rendering.
    if ( metadata.render 
      && (metadata.render !== "directory" || metadata.render !== "content") ) {
        smith.log.silly('Content page ' + i + ' specified renderer ' + metadata.render);
        smith.log.silly('Not rendering ' + i);
        return null;
    }

    // If content exists, parse it with the markdown parser.
    if (pages[i].content) {
      smith.log.silly('Parsing markdown from ' + i);
      md = marked(pages[i].content.toString());
    }

    // If there's author metadata, join the authors metadata with the content
    // metadata.
    //
    // smith.content.authors[metadata.author] is an nconf object, and .file.store
    // is a raw object of the configuration data (from file).
    if (metadata && metadata.author) {
      smith.log.silly('Attaching author metadata for ' + i);
      // Build up "by this author" listings
      byThisAuthor = buildToc({
        author: metadata.author,
        filterTitle: metadata.title
      });


      if (smith.content.authors[metadata.author]) {
        metadata.author = smith.content.authors[metadata.author].file.store;

        if (metadata.author.email) {
          metadata.author.gravatar = metadata.author.email;
        }

      } else {
        metadata.author = { name: metadata.author };
      }
    }

    // If there's content, use the "article" view.
    if ( (typeof md !== 'undefined') && (typeof metadata !== 'undefined')) {
      try {
        dom.innerHTML = (function () {
          if (metadata.theme) {
            if (smith.content.theme[metadata.theme]) {
              smith.log.silly('Using theme '+path.resolve(metadata.theme)+' for page '+i);
              return smith.content.theme[metadata.theme].toString();
            }
            else {
              smith.log.warning('Theme file ' + path.resolve('./theme/'
                + metadata.theme )
                + 'does not exist!'
              );
              smith.log.warning('Using theme '
                + path.resolve('./theme/article.html')
                + ' instead.');
              return smith.content.theme['./article.html'].toString();
            }
          }
          else {
            smith.log.silly('Using theme '+ path.resolve('./theme/article.html')
              + ' for page ' + i
            );
            return smith.content.theme['./article.html'].toString();
          }
        })();
      }
      catch (err) {
        smith.log.error('DOM error while loading theme for page '+i);
        throw err;
      }

      data = { 
        metadata: metadata, 
        content: md,
        pwd: pwd,
        ls: ls,
        toc: (metadata.toc && metadata.toc.length)
          ? tocLast(metadata.toc.length)
          : toc
      };

      if (byThisAuthor) {
        data.byThisAuthor = byThisAuthor;
      }

    // If there's no content, use the "directory" view.
    } else {
      smith.log.silly('Using theme '+ path.resolve('./theme/directory.html')
        + ' for page ' + i
      );
      try {
        dom.innerHTML = smith.content.theme['./directory.html'];
      }
      catch (err) {
        smith.log.error('DOM error while loading theme for page '+i);
        throw err;
      }

      data = {
        pwd: pwd,
        ls: ls,
        metadata: metadata,
        toc: (metadata.toc && metadata.toc.length)
          ? tocLast(metadata.toc.length)
          : toc
      };

      if (byThisAuthor) {
        data.byThisAuthor = byThisAuthor;
      }

      if (typeof data.metadata === "undefined") {
        data.metadata = { breadcrumb: ["."] };
      }

    }

    // Weld the data to the dom.
    weld(dom, data, {
      map: function(parent, element, key, val) {

        // Build a breadcrumb.
        if ($(element).hasClass('breadcrumb')) {
          var crumb = '';

          $('.breadcrumb', parent).each(function(i,v){
            crumb += ('/' + $(v).html());
          });
          crumb += ('/' + val);
          $(element).attr('href', crumb);
          $(element).html(val);

          return false
        }

        // If there is a "ls" element, populate it with a list of files in the
        // directory.
        if ($(element).hasClass("ls")) {

          // The "value" is a path.
          var title = path.basename(val),
              listing;

          // A listing is a row in a table.
          listing = $("<tr>").attr("class", "ls").append(
            $("<td>").append(
              $("<a>").attr("href", val.replace("pages/", "")).text(title)
            )
          );

          $("tr", $(element)).replaceWith(listing);

          return false;
        }

        // Titles should link to their respective articles.
        if ($(element).hasClass("title")) {
          if (val) {
            $(element).text("");
            $(element).append(
              $("<a>")
                .attr("href", helpers.unresolve(smith.src, metadata.link))
                .text(val)
            );
          }
          return false;
        }

        // Handles cases with the "date" element in the article template.
        // This includes using the "datetime" attribute.
        if ($(element).hasClass("date")) {
          var date = val ? new Date(val) : undefined;

          if (date) {
            if (element.tagName === "DATA") {
              $(element).attr("value", date);
            }
            $(element).text(helpers.formatDate(date));
          }
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

        // In the case of markdown, we don't want to encode html entities.
        try {
          element.innerHTML = val;
        }
        catch (err) {
          smith.log.error('Error welding raw html for page ' + i);
          throw err;
        }
        return false;
      }

    });

    // TODO: A var this far downpage indicates poor modularity.
    var hasSnippets = false;

    // Handle code snippet includes.
    // Hilighting gets taken care of later, with "code" blocks
    $('a.snippet', dom).each(function (i, e) {
      var p = path.join(smith.src, e.href),

          // TODO: I should be able to get this out of content[i].files right?
          // Also: This looks messed up.
          f = fs.readFileSync(p).toString(),
          pre = $('<pre>').append($('<code>').text(f)),
          link = $('<a>').attr('href', e.href).text(path.basename(e.href)),
          snippet = $('<div>').attr('class', 'snippet')
            .append(link.attr('class', 'code-link'))
            .append(pre);

      hasSnippets = true;

      $(e).replaceWith(snippet);

      // Add this one to the "snippets" listing.
      $('.snippets', dom).html("");
      $('.snippets', dom).append(
        $('<li>').append(link)
      );

    });

    // remove snippets if necessary
    if (!hasSnippets) {
      $('.snippets', dom).remove();
      $('.if-snippets', dom).remove();
    }

    // If metadata is missing, we need to clean the elements from the dom that
    // were intended to display that information.
    // These are in `metadata`.
    ['title' ].forEach(function (k) {
      if (!metadata || typeof metadata[k] === "undefined") {
        $(".metadata ."+k, dom).remove();
      }
    });

    // These are in `metadata.author`.
    ['name', 'location', 'github', 'twitter', 'date'].forEach(function (k) {
      if (!metadata || !(metadata.author)) {
        $("."+k, dom).remove();
        $(".if-"+k, dom).remove();
      }
    });

    // These are at the top level.
    ['ls', 'byThisAuthor'].forEach(function (k) {
      if (!data[k] || (data[k] && !data[k].length) ) {
        $("."+k, dom).remove();
        $(".if-"+k, dom).remove();
      }
    });

    // Give the page a title.
    $('title', dom).text(
      ((metadata && metadata.title)
        ? metadata.title
        : '')
      + ' - ' + $('title', dom).text()
    );

    // Add some meta tags. These are populated from a global config as well as
    // content metadata.
    $('meta[name=keywords]', dom).attr('content',
      (metadata && metadata.tags || [])
        .concat(smith.config.get("tags") || []).join(',')
    );

    // In order to ensure that code highlighting doesn't break, we use jquery to
    // remove any HTML applied to the code snippets.
//    Array.prototype.forEach.call($('code', dom), function (elem) {
//      $(elem).html($(elem).text());
//    });

    // Performs code highlighting, converting only inside <code> blocks.
    //
    // Note: The hilighter tries to hilight "&gt;" as
    //
    //     `&amp;<span class="identifier">gt</span>;`
    //
    // There are probably a few other html identities that also get incorrectly
    // highlighted (such as &lt;).
    // The easiest way to fix this, besides using a different highlighter,
    // turns out to be running a greedy search/replace for the
    // bungled highlight.
    try {
      dom.innerHTML = hl(dom.innerHTML, false, true)
        .replace( new RegExp("&amp;<span class=\"identifier\">gt</span>;",
                  "g"), "&gt;");
    }
    catch (err) {
      smith.log.error('Error while attempting to hilight code snippets for ' + i);
      throw err;
    }

    // After welding, pull the html back out of the dom.
    smith.log.silly('Successfully completed weld step for ' + i);
    pages[i].content = dom.innerHTML;

  });

  return dom;

};

content.generate = function(output, pages) {

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function (file) {

    var newPath = file.replace(path.resolve(smith.src), path.resolve(smith.dst)),
        content = pages[file].content;

    newPath =  path.normalize(newPath + '/index.html');

    if (content) {

      if (typeof content !== 'string' && !Buffer.isBuffer(content)) {
        smith.log.warn('Content from '+file+' is of type '+(typeof content));
      }

      smith.log.debug("Writing " + newPath);

      fs2.writeFile(newPath, pages[file].content, function (err) {
        if (err) {
          smith.log.error('Error while writing '+newPath+' to disk:');
          throw err;
        }
      });
    } else {
      // If a file is handled by a different renderer, the content may get
      // written later.
      smith.log.silly("No content for " + newPath);
    }
  });

  return pages;
};
