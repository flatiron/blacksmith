var findit = require('findit'), 
    path   = require('path'),
    hl     = require('../../vendor/highlight/lib/highlight').Highlight,
    markdown = require('github-flavored-markdown'),
    mkdirp = require('mkdirp'),
    fs     = require('fs'),
    docs   = require('../docs'),
    weld   = require('weld').weld,
    pf = require('pathfinder'),
    helpers = require('../helpers');

var article = exports;


article.weld = function(dom, articles) {

    //
    //  Remark: Create a short-cut reference to the jQuery object
    //
    var $ = docs.window.$;

    // load all articles 
    var _articles = findit.sync('./pages/articles');

    //
    // Filter out all non-markdown files
    //
    _articles = _articles.filter(function(a){
      a = a.replace('./pages/articles', '');
      if(a.match(/\./)){
        return false;
      } else {
        return true;
      }
    });

  // Here, we build up the table of contents.
  var toc = helpers.filesToTree(_articles);
      toc = helpers.treeToHTML(toc);

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
            $(element).attr("datetime", (new Date(val)).toISOString());
            $(element).text(val);
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
    $('meta[name=keywords]', dom).attr('content', metadata.tags.concat([
      'node',
      'Node',
      'nodejs',
      'javascript',
      'docs',
      'documentation',
      'how-to',
      'tutorials',
      'nodejitsu']).join(','));

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
    var newPath = file.replace('./pages', '/../../public');
    newPath =  path.dirname(newPath);
    newPath =  path.normalize(__dirname + newPath + '/index.html');
    pf.writeFile(newPath, articles[file].content, function(){});
  });

  return articles;
};


article.load = function (resolve) {
  
  // load all articles 
  var articles = pf.readDirSync('./pages', true, function (p) {
    return !fs.statSync(p).isDirectory();
  });

  return helpers.articlesToObject(articles);
  
};
