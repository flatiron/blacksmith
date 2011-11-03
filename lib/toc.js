/*
 * toc.js
 *
 * This is what ends up generating the table of contents.
 *
 */

var table = exports;

var docs     = require("./docs"),
    fs       = require('fs'),
    fs2      = require('./fs2'),
    path     = require('path'),
    Hash     = require('hashish'),
    traverse = require('traverse'),
    helpers  = require('./helpers');

// This helper assists in building a Table of Contents.
table.buildToc = function () {

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

  // The directory list does not include the top level. This is important if
  // there is no nested content.
  _articles[src] = { "isDirectory": true };

  console.log(_articles);

  // In this case, .isDirectory adds an unneeded layer to our tree so instances
  // of .isDirectory are filtered out here.
  Object.keys(_articles).forEach(function (i) {
    if (_articles[i].isDirectory) {
      _articles[i] = null;
    }
  });

  // Generate a tree.
  var toc = fs2.dirToTree(_articles),
      parent = "";

  // Order the tree.
  toc = fs2.orderedTree(toc);

  // Sort the tree.
  toc = table.sort(toc);

  // Dig until there is a layer with >1 item in it. This way, the ToC doesn't
  // have a single item in it, with every relevant listing underneath it.
  while (toc.length === 1) {
    var row = toc[0];
    var key = Object.keys(row)[0];

    // This is so that links in the ToC are still correct.
    parent += ("/"+key);

    toc = toc[0][key];
  }

  // Convert the orderedTree into HTML.
  return helpers.treeToHTML(toc, parent);
}

// This helper sorts a table of contents structure.
table.sort = function (toc) {

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
