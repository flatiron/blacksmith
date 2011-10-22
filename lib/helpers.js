//
//  helpers.js
//

var helpers = exports;

var docs = require("./docs"),
    fs = require('fs'),
    fs2 = require('./fs2'),
    findit = require('findit'),
    path = require('path'),
    traverse = require('traverse');

helpers.unresolve = function (base, abs) {
  return abs.replace(base, ".");
}

helpers.buildToc = function (src) {

  var p = helpers.unresolve(path.resolve(__dirname + "/../pages"), src);

  var _articles = findit.sync(src);

  //
  // Filter out all non-markdown files
  //
  _articles = _articles.filter(function(a){
    a = path.resolve(a);
    if(a.match(/\./)){
      return false;
    } else {
      return true;
    }
  });

  _articles = _articles.map(function (a) {
    return helpers.unresolve(src, a);
  });

  // toc has an "undefined" value.
  var toc = fs2.filesToTree(_articles);

  return helpers.treeToHTML(toc);
}

// xs.indexOf(e) returns -1 if no element, the element's index otherwise.
// -~x is truthy if x is non-negative.
var isElement = helpers.isElement = function(xs, e) {
    return -~xs.indexOf(e);
}

//
// Function to use with sorting the ToC.
// ie. toc.sort(tocSort);
//
helpers.tocSort = function (a, b) {
  // For future reference, here is the list from the top-level.
  /*[
    'cryptography',
    'advanced',
    'intermediate',
    'errors',
    'file-system',
    'javascript-conventions',
    'child-processes',
    'command-line',
    'REPL',
    'getting-started',
    'HTTP' ]
  */

  // These items should be listed *first*.
  var first = [
    'getting-started',
    'javascript-conventions'
  ];

  // These items should be listed *last*.
  var last = [
    'intermediate',
    'advanced',
    'cryptography'
  ];

  var aInFirst = isElement(first, a),
      bInFirst = isElement(first, b),
      aInLast = isElement(last,a),
      bInLast = isElement(last, b);


  // Handles the case where a and/or b is in the "first" list.
  if ( aInFirst || bInFirst ) {
    if (aInFirst && bInFirst) {
        return first.indexOf(a)-first.indexOf(b);
    } else {
        return aInFirst ? -1 : 1;
    }
  }

  if ( aInLast || bInLast ) {
    if ( aInLast && bInLast) {
      return last.indexOf(a) - last.indexOf(b);
    } else {
      return aInLast ? 1 : -1;
    }
  }

  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }

};

helpers.treeToHTML = function(values, parent) {
  var str = '<ul>';

  //
  // Sort the keys here for a reasonable ToC layout.
  //
  Object.keys(values).sort(helpers.tocSort).forEach( function(key) {

    if (typeof values[key]=='object' && values[key] != null){
      var newParent = parent || '';
      newParent = newParent + '/' + key;
      var link = '/articles' + newParent;
      str+='<li><a href="' + link + '">'+key.replace(/-/g, ' ')+'</a>' +helpers.treeToHTML(values[key], newParent)+'</li>';
    }
  });

   str+='</ul>';

   if(str === "<ul></ul>"){
     return '';
   }
   return str;
};


helpers.articlesToObject = function (src, files) {
  var articles = {};

  Object.keys(files).forEach(function (f) {
    var pathName = path.dirname(f) + "/article.md";
    if (path.basename(f) === "metadata.json") {
      if (!articles[pathName]) {
        articles[pathName] = {};
      }

      try {
        articles[pathName].metadata = JSON.parse(files[f]);
      } catch (e) {
        throw new Error("Failed to parse \""+files[f]+"\"");
      }
      articles[pathName].metadata.link = pathName;
      articles[pathName].metadata.breadcrumb = pathName.replace(path.dirname(src), "").split("/");

      articles[pathName].metadata.breadcrumb = articles[pathName]
        .metadata
        .breadcrumb
        .slice(2, articles[pathName].metadata.breadcrumb.length-1);

    }
    else if (path.basename(f) === "article.md") {
      if (!articles[pathName]) {
        articles[pathName] = {};
      }

      articles[pathName].content = files[f].toString();

    }

  });

  return articles;
}

// Takes a directory, does some slicing/dicing to consolidate information and handle defaults
helpers.dirToContent = function (src, files, resolve) {
  var content = {};
  if (typeof resolve === "undefined") {
    resolve = true;
  }

  Object.keys(files).forEach(function (f) {

    // we want the paths to represent path-based resources,
    // not individual files as before
    var p = path.dirname(f);
    if (!content[p]) {
      content[p] = {};
    }

    // if it's a metadata.json, load the metadata.
    if (path.basename(f) === "metadata.json") {
      try {
        content[p].metadata = JSON.parse(files[f]);
      } catch (e) {
        content[p].metadata = {};
      }

      // what is "link" used for?
      content[p].metadata.link = p;

      // build up a "breadcrumb"
      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p].metadata.breadcrumb.slice(2, content[p].metadata.breadcrumb.length);

    } // grab content---assumes content is in "article.md" for now
    else if (path.basename(f) === "article.md") {
      if (!content[p]) {
        content[p] = {};
      }

      if (resolve) {
        content[p].content = files[f].toString();
      } else {
        content[p].content = "";
      }

    } else if (fs.statSync(f).isDirectory()) {
      // Directory stuffs
      if (!content[p]) {
        content[p] = {};
      }

      content[p].ls = fs.readdirSync(p).map(function(file) {
        return helpers.unresolve(docs.src, p+"/"+file).replace(/^\./, '');
      });

      // build up a "breadcrumb"
      // if (!content[p].metadata) {
      content[p].metadata = {};

      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p].metadata.breadcrumb.slice(2, content[p].metadata.breadcrumb.length);




    } else if (fs.statSync(f).isFile()) {
      // these are "other" files.
      if (!content[p]) {
        content[p] = {};
      }

      if (!content[p].files) {
        content[p].files = {};
      }

      content[p].files[path.basename(f)] = Buffer.isBuffer(files[f]) ? files[f].toString() : files[f];
      try {
        content[p].files[path.basename(f)] = JSON.parse(content[f].files[path.basename(f)]);
      } catch (e) {
        //don't care
      }
    }

  });


  return content;
}
