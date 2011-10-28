/*
 * helpers.js
 *
 * Contains helpers for the docs.
 *
 */
var helpers = exports;

var docs = require("./docs"),
    fs = require('fs'),
    fs2 = require('./fs2'),
    findit = require('findit'),
    path = require('path'),
    Hash = require('hashish'),
    traverse = require('traverse');


// This function inverts path.resolve() given the base path:
//
//    helpers.unresolve(base, helpers.resolve(relative)) === relative
//
// It's helpful for cases where a path has been previously resolved when it
// should be relative to a source directory.
helpers.unresolve = function (base, abs) {
  return abs.replace(base, ".");
}

// Test to see if `e` is an element of `xs`.
//
// xs.indexOf(e) returns -1 on no match, and the element's index otherwise.
// -~x is truthy if x is non-negative.
var isElement = helpers.isElement = function(xs, e) {
    return -~xs.indexOf(e);
}

// This helper assists in building a Table of Contents.
helpers.buildToc = function () {

  // TODO: Instead of hard-coding the source folder, we should instead use
  // docs.src. However, given that we're not supporting multi-site, this is
  // fine.
  var src = "./pages",
      _articles;

  // Get a list of directories.
  // TODO: Can this pull from docs.content.content ?
  _articles = fs2.readDirSync(src, true, function (a) {
    return path.extname(a).length === 0;
  });

  // In this case, .isDirectory adds an unneeded layer to our tree so instances
  // of .isDirectory are filtered out here.
  Object.keys(_articles).forEach(function (i) {
    if (_articles[i].isDirectory) {
      _articles[i] = null;
    }
  });

  // Generate a tree.
  var toc = fs2.dirToTree(_articles);

  // Order the tree.
  toc = fs2.orderedTree(toc);

  // Sort the tree.
  toc = helpers.tocSort(toc);

  // Dig until there is a layer with >1 item in it. This way, the ToC doesn't
  // have a single item in it, with every relevant listing underneath it.
  while (toc.length === 1) {
    var row = toc[0];
    var key = Object.keys(row)[0];

    toc = toc[0][key];
  }

  // Convert the orderedTree into HTML.
  return helpers.treeToHTML(toc);
}

// This helper sorts a table of contents structure.
helpers.tocSort = function (toc) {

  // Map over the ToC recursively.
  return toc.map(function sorter (row, paths) {

    // Each row in the ToC has the form:
    //
    //     { "key": subtoc }
    //
    var paths = paths || [],
        key = Object.keys(row)[0],
        subtoc = row[key],
        paths = paths.concat([[key]]);

    // Uncomment this for a pretty directory view.
    // console.log(Array(paths.length+1).join(Array(3).join(" ")) + "-"+paths[paths.length-1]);

    // If there is no page.json, this "try" will fail.
    // For more, read comments under the "catch".
    //
    // TODO: Use docs.src instead of hard-coded page.json.
    // TODO: Rewrite this to use more explicit file checks?
    try {

      // If the page.json exists, it may have an "order" property, which matches
      // children directory names with list indices.
      var order = JSON.parse(
            fs.readFileSync(paths.join("/")+"/../page.json").toString()
          ).order;

      // "Order" supports negative indices, as in Python. This map converts
      // those negative indices into proper positive ones.
      order = Hash(order).map(function (n) {
        if (n < 0) {
          return Object.keys(subtoc).length + n;
        } else {
          return n;
        }
      }).items;

      // This immediately-executed function sorts the subtoc based on "order".
      subtoc = (function () {

        // We end up copying items from the "oldtoc" to the "newtoc" later.
        //
        // This algorithm checks for the keys on the root of this subtoc
        // often, so we extract those out for easier matching later.
        var oldToc = subtoc,
            newToc = Array(subtoc.length);
            elements = oldToc.map(function (t) {
              return Object.keys(t)[0];
            });

        // Place the elements that are explicitly ordered.
        Object.keys(order).forEach(function (name) {

          var setOrder = order[name],
              currentOrder = elements.indexOf(name);

          if (currentOrder !== -1) {
            // Copy the row into the new Table of Contents.
            newToc[setOrder] = subtoc[currentOrder];

            // oldToc holds toc elements not in newToc, but we pull newTocs from
            // subtoc so that the indices match.

            // Find the moved element in the oldToc and then remove it.
            // Later, we use oldToc to fill in unspecified indices.
            var i = oldToc.map(function (t) {
              return Object.keys(t)[0];
            }).indexOf(name);

            oldToc = oldToc.slice(0, i).concat(oldToc.slice(i+1));
          }
        });

        // Use elements not explicitly ordered to fill out the rest of the
        // newToc.
        for (var i = 0; i < newToc.length; i++) {
          newToc[i] = newToc[i] || oldToc.pop();
            
        }

        return newToc;

      })();
      
    } catch (e) {
      // Remember, if the "try" block throws it's likely because either the file
      // doesn't exist (which is almost expected), it contains invalid JSON, or
      // the contents of the JSON are somehow breaking things.
      //
      // Here, we can catch "bad file descriptor" errors and ignore them (since
      // it means the user just didn't write out a page.json.
      if (e.code !== "EBADF") {
        throw e;
      }
    }

    //
    if (Array.isArray(subtoc)) {
      // Map over the array.
      return subtoc.map(function (row) {
        var newRow = {};
        var key = Object.keys(row)[0];

        newRow[key] = sorter(row, paths);
        return newRow;
      });
    } else {
      return subtoc;
    }

  })[0]; // Note that the end result has a list inside of a list.
};


// Takes a sortedTree and generates html with it.
//
// TODO: Use weld instead of string concats.
helpers.treeToHTML = function(values, parent) {
  var str = '<ul>';

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

// Takes a directory, does some slicing/dicing to consolidate information and
// handle defaults. This is used in tandem with the "content" generator.
//
// Arguments:
// * src: The path to the source directory.
// * files: The "dir" structure
// * resolve [optional]: If truthy, attaches markdown content.
helpers.dirToContent = function (src, files, resolve) {
  var content = {};
  if (typeof resolve === "undefined") {
    resolve = true;
  }

  Object.keys(files).forEach(function (f) {

    // We want the paths to represent path-based resources,
    // not individual files as before. Data from page.json and content.md get
    // attached to the same "parent" path.
    var p = path.dirname(f);
    if (!content[p]) {
      content[p] = {};
    }

    // If the file is a page.json, load the metadata and attach it.
    if (path.basename(f) === "page.json") {
      try {
        content[p].metadata = JSON.parse(files[f]);
      } catch (e) {
        content[p].metadata = {};
      }

      // What is "link" used for? Do we still need it?
      content[p].metadata.link = p;

      // Build up a "breadcrumb" by splitting the path and cleaning it up.
      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p].metadata.breadcrumb.slice(2, content[p].metadata.breadcrumb.length);

    } // If the file is a content.md, load and attach the markdown.
    else if (path.basename(f) === "content.md") {
      if (!content[p]) {
        content[p] = {};
      }

      if (resolve) {
        content[p].content = files[f].toString();
      } else {
        content[p].content = "";
      }
      
    } // If the file is a directory instead, we still need breadcrumbs.
    else if (fs.statSync(f).isDirectory()) {
      if (!content[p]) {
        content[p] = {};
      }

      content[p].ls = fs.readdirSync(p).map(function(file) {
        return helpers.unresolve(docs.src, p+"/"+file).replace(/^\./, '');
      });

      // Build up a "breadcrumb" as before.
      if (!content[p].metadata) {
        content[p].metadata = {};
      }

      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p].metadata.breadcrumb.slice(2, content[p].metadata.breadcrumb.length);




    } else if (fs.statSync(f).isFile()) {
      // This catches "other" files which may be in the directory structure.
      // It attaches them to a property called "files."
      if (!content[p]) {
        content[p] = {};
      }

      if (!content[p].files) {
        content[p].files = {};
      }

      // If resolve, load up the data.
      if (resolve) {
        content[p].files[path.basename(f)] = Buffer.isBuffer(files[f]) ? files[f].toString() : files[f];

        try {
          // If it's JSON, we might as well load it.
          content[p].files[path.basename(f)] = JSON.parse(content[f].files[path.basename(f)]);
        } catch (e) {
          // It must not've been JSON. Forget about it!
        }
      }
    }

  });

  return content;
}
