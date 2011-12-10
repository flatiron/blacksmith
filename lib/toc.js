/*
 * toc.js
 *
 * This is what ends up generating the table of contents.
 *
 */

var table = exports;

var smith    = require("./blacksmith"),
    fs       = require('fs'),
    fs2      = require('./fs2'),
    path     = require('path'),
    Hash     = require('hashish'),
    traverse = require('traverse'),
    helpers  = require('./helpers');

// This helper assists in building a Table of Contents.
table.buildToc = function (options) {

  // TODO: Instead of hard-coding the source folder, we should instead use
  // smith.src. However, given that we're not supporting multi-site, this is
  // fine for now.
  var src = "./pages",
      _articles;

  // Get a list of directories.
  // TODO: Ideally, we would use smith.content.content, but that hasn't been
  // loaded yet!
  _articles = fs2.readDirSync(src, true, function (a) {
    return fs.statSync(a).isDirectory();
  });

  // The directory list does not include the top level. This is important if
  // there is no nested content.
  _articles[src] = { "isDirectory": true };

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
        filename = path.resolve("./"+paths.concat([[key]]).join("/")),
        order;

    paths = paths.concat([[key]]);

    // Uncomment this for a pretty directory view.
    // console.log(Array(paths.length+1).join(Array(3).join(" ")) + "-"+paths[paths.length-1]);

    // JSON.stringify(subtoc, true, 2).split('\n').forEach(function (l) { console.log(l); });

    // Sort the toc using various prioritized heuristics.
    [
      "bySpecified",
      "byDate"
    ].forEach(function (f) {
      subtoc = require("./toc/sorters")[f].call(null, subtoc, filename);
    });

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
