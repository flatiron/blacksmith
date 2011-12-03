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
    markdown = require('github-flavored-markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    smith    = require('../blacksmith'),
    weld     = require('weld').weld,
    helpers  = require('../helpers');

var content = exports;


content.weld = function(dom, pages) {

  // Shortcut to jquery
  var $ = smith.window.$;

  // Shortcut to generated table of contents.
  var toc = smith.content.toc;

  // Truncate the ToC TODO: Make configurable.
  toc = $('<ul>').append($($(toc).html()).slice(0, 10)).html();

  Object.keys(pages).forEach( function (i) {
    var metadata = pages[i].metadata || {},
        md,
        data;

    // If a page has a specified renderer that isn't handled by "content",
    // return early to short-circuit rendering.
    if ( metadata.render 
      && (metadata.render !== "directory" || metadata.render !== "content") ) {
        return null;
    }

    // If content exists, parse it with the markdown parser.
    if (pages[i].content) {
      md = markdown.parse(pages[i].content.toString());
    }

    // If there's author metadata, join the authors metadata with the content
    // metadata.
    //
    // smith.content.authors[metadata.author] is an nconf object, and .file.store
    // is a raw object of the configuration data (from file).
    if (metadata && metadata.author) {
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
    if ( (typeof md !== "undefined") && (typeof metadata !== "undefined")) {

      dom.innerHTML = smith.content.theme['./article.html'].toString();

      data = { 
        metadata: metadata, 
        content: md,
        ls: pages[i].ls || [],
        toc: toc
      };

    // If there's no content, use the "directory" view.
    } else {
      dom.innerHTML = smith.content.theme['./directory.html'];

      data = {
        pwd: helpers.unresolve(smith.src, i),
        ls: pages[i].ls || [],
        toc: toc,
        metadata: metadata
      };

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
        // TODO: Make the link actual point to the article in question.
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
            $(element).attr("datetime", date);
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
        element.innerHTML = val;
        return false;
      }

    });


    // If metadata is missing, we need to clean the elements from the dom that
    // were intended to display that information.
    ['title'].forEach(function (k) {
      if (metadata && typeof metadata[k] === "undefined") {
        $(".metadata ."+k, dom).remove();
      }
    });

    ['ls'].forEach(function (k) {
      if (data && data[k] === "undefined") {
        $("."+k, dom).remove();
      }
    });

    [ 'date' ].forEach(function (k) {
      if (metadata && typeof metadata[k] === "undefined") {
        $(".metadata ."+k, dom).parent().parent().parent().remove();
      }
    });

    // Give the page a title.
    $('title', dom).html('node docs'
      + (metadata && metadata.title)
        ? ' :: ' + metadata.title
        : ''
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
    dom.innerHTML = hl(dom.innerHTML, false, true)
      .replace( new RegExp("&amp;<span class=\"identifier\">gt</span>;",
                "g"), "&gt;");

    // After welding, pull the html back out of the dom.
    pages[i].content = dom.innerHTML;

  });

  return dom;

};

content.generate = function(output, pages) {

  // Write all the welded pages to disk.
  Object.keys(pages).forEach(function(file){

    var newPath = file.replace(path.resolve(smith.src), path.resolve(smith.dst));

    newPath =  path.normalize(newPath + '/index.html');

    if (pages[file].content) {

      smith.log.info("Writing " + newPath);

      fs2.writeFile(newPath, pages[file].content, function (err) {
        if (err) {
          throw err;
        }
      });
    } else {
      // If a file is handled by a different renderer, the content may get
      // written later.
      // console.log("No content for "+newPath);
    }
  });

  return pages;
};



// Load all content with an fs2.readDirSync.
content.load = function () {
  if (!smith.src) {
    smith.src = "../../pages";
  }

  // Load all the contents.
  // Pages is a hash with key/value pairs of the form `{ "path": "content" }`.
  var pages = fs2.readDirSync(smith.src, true);

  // Combine content and metadata pages to generate key/value pairs that are 1:1
  // with generated content pages.
  pages = helpers.dirToContent(smith.src, pages, true);

  return pages;
  
};
