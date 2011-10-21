var findit = require('findit'), 
    path   = require('path'),
    hl     = require('../../vendor/highlight/lib/highlight').Highlight,
    markdown = require('github-flavored-markdown'),
    mkdirp = require('mkdirp'),
    fs     = require('fs'),
    fs2 = require('../fs2'),
    docs   = require('../docs'),
    weld   = require('weld').weld,
    helpers = require('../helpers');

var article = exports;


article.weld = function(dom, articles) {

  //
  //  Remark: Create a short-cut reference to the jQuery object
  //
  var $ = docs.window.$;


  // Here, we build up the table of contents.
  var toc = helpers.buildToc(docs.src);

  Object.keys(articles).forEach( function (i){
    var content;
    try {
      content = markdown.parse(articles[i].content.toString());
    } catch (err) {
      content = err.message;
    }
    var metadata = articles[i].metadata;
    //join the author metadata
    metadata.author = docs.content.authors[metadata.author] || { name: metadata.author};

    // This is a good place to try explicitly setting the doctype for the
    // dom. However, validating the doctype before trying to assign it
    // is hard, and it's basically a global setting because we weld all
    // documents before writing them out.
    dom.innerHTML = docs.content.theme['./theme/article.html'].toString();

    var data = { 
      metadata: metadata, 
      content: content,
      toc: toc
    };

    weld(dom, data, {
      map: function(parent, element, key, val) {
        //
        // Create breadcrumb
        //
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

        //date semantics
        if ($(element).hasClass("date")) {
            var date = val ? new Date(val).toISOString() : undefined;
            if (val) {
                $(element).attr("datetime", new Date(val).toISOString());
                $(element).text(val);
            } else {
              //TODO: If there isn't any metadata, we shouldn't have the "by x on y" div.
            }
            return false;
        }

        if ($(element).hasClass("github")) {
            if (val) {
                $(element).append(
                    $("<a>").attr("href", "https://github.com/"+val).text("[github]")
                );
            }
            return false;
        }

        element.innerHTML = val;
        return false;

      }

    });

    //Give the page a title
    $('title', dom).html('node docs - ' + metadata.title);

    //Add some meta tags
    $('meta[name=keywords]', dom).attr('content', (metadata.tags || []).concat(docs.config.get("tags") || []).join(','));

    //
    // Remark: perform code highlighting, convert only inside <code/>
    // 
    // TODO: the current code highlighting is slow, very slow.
    //

    //
    // Remark: The hilighter tries to hilight "&gt;" as
    //
    //     `&amp;<span class="identifier">gt</span>;`
    //
    // There are probably a few other html identities that also get incorrectly highlighted (such as &lt;).
    // The easiest way to fix this, besides using a different highlighter,
    // turns out to be running a greedy search/replace for the
    // bungled highlight.

    dom.innerHTML = hl(dom.innerHTML, false, true)
        .replace(new RegExp("&amp;<span class=\"identifier\">gt</span>;", "g"), "&gt;");

    articles[i].content = dom.innerHTML;

  });
  return dom;
};

article.generate = function(output, articles) {

  //
  // Generate all articles
  //
  Object.keys(articles).forEach(function(file){
    // TODO: Figure out why this is breaking!!
    var newPath = file.replace(path.resolve(docs.src), path.resolve(docs.dst));
    newPath =  path.dirname(newPath);
    newPath =  path.normalize(newPath + '/index.html');
    fs2.writeFile(newPath, articles[file].content, function(){});
  });

  return articles;
};


article.load = function (resolve) {
  
  // load all articles 
  var articles = fs2.readDirSync(docs.src, true, function (p) {
    if (path.existsSync(p) && path.basename(p) === "metadata.json") {
      // try to read the path as though it's json
      try {
        var md = JSON.parse(fs.readFileSync(p).toString());
        // filter if generator is not article.
        var thing = !(md.generator && md.generator !== "article");
        return thing;
      } catch (e) {
        console.log("error reading "+p+"; skipping.");
        return false;
      }
    }

    // No directories.
    return !fs.statSync(p).isDirectory();
  });

  return helpers.articlesToObject(docs.src, articles);
  
};
