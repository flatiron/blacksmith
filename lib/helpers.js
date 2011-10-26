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

  var src = "./pages";

  // get list of directories.
  var _articles = fs2.readDirSync(src, true, function (a) {
    return path.extname(a).length === 0;
  });

  Object.keys(_articles).forEach(function (i) {
    if (_articles[i].isDirectory) {
      _articles[i] = null;
    }
  });

  // build up the tree.
  var toc = fs2.dirToTree(_articles);

  // sort the tree.
  toc = helpers.tocSort(toc)[0];

  // digs until there is a layer with >1 item in it.
  while (toc.length === 1) {
    var row = toc[0];
    var key = Object.keys(row)[0];

    toc = toc[0][key];
  }

  return helpers.treeToHTML(toc);
}

// xs.indexOf(e) returns -1 if no element, the element's index otherwise.
// -~x is truthy if x is non-negative.
var isElement = helpers.isElement = function(xs, e) {
    return -~xs.indexOf(e);
}

//
// Function to use with sorting the ToC.
// ie. tocSort(toc);
//
helpers.tocSort = function(toc) {
  return toc.map(function sortToc (row, paths) {
    var paths = paths || [];
    var key = Object.keys(row)[0];
    var subtoc = row[key];

    var paths = paths.concat([[key]]);

    //Pretty sweet directory view XD
    //console.log(Array(paths.length+1).join(Array(3).join(" ")) + "-"+paths[paths.length-1]);

    // TODO: fs.fileExists instead
    try {
      var order = JSON.parse(fs.readFileSync(paths.join("/")+"/../metadata.json").toString()).order;

      // try to sort the table of contents
      subtoc = subtoc.sort(function (a, b) {
        var aKey = Object.keys(a)[0];
        var bKey = Object.keys(b)[0];

        var aIndex = order[aKey] || 0;
        var bIndex = order[bKey] || 0;


        // would be cleaner with a sgn() function
        if (aIndex < 0) {
          aIndex = subtoc.length + aIndex;
        } else if (aIndex > 0) {
          aIndex = aIndex - subtoc.length;
        }

        if (bIndex < 0) {
          bIndex = subtoc.length + bIndex;
        } else if (bIndex > 0) {
          bIndex = bIndex - subtoc.length;
        }

        return aIndex-bIndex;
      });


    } catch (e) {
      //this just means there's nothing to sort.
      if (e.code !== "EBADF") {
        throw e;
      }
    }

    if (typeof subtoc === "object" && subtoc !== null) {
      return subtoc.map(function (row) {
        var newRow = {};
        var key = Object.keys(row)[0];

        newRow[key] = sortToc(row, paths);
        return newRow;
      });
    } else {
      return subtoc;
    }
  });
};

// TODO: Use weld.
helpers.treeToHTML = function(values, parent) {
  var str = '<ul>';

  if (typeof values === "string") {
    //todo: Make source of value be the article name.

    //var title = values.split("/");
    //title = title[title.length-1];

    return "";

  }

  values.forEach( function(val, i) {
    if (val) {
      var key = Object.keys(val)[0];
    }
    if (typeof values[i]=='object' && values[i] != null){
      var newParent = parent || '';
      newParent = newParent + '/' + key;
      var link = '/articles' + newParent;
      str+='<li><a href="' + link + '">'+key.replace(/-/g, ' ')+'</a>' + helpers.treeToHTML(values[i][key], newParent)+'</li>';
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
      if (!content[p].metadata) {
        content[p].metadata = {};
      }

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
