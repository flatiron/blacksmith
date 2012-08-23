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

  var src = smith.src,
      content = smith.content.content;

  if (options.author) {
    content = Hash.filter(content, function (v, k) {
      if (v.metadata && v.metadata.author) {
        return v.metadata.author === options.author;
      }
      return false;
    });
  }

  if (options.filterTitle) {
    content = Hash.filter(content, function (v, k) {
      if (v.metadata && v.metadata.link) {
        return v.metadata.title !== options.filterTitle
      }

      return true;

    });
  }

  // Removes items that should not be indexed.
  content = Hash.filter(content, function (v, k) {
    if (v.metadata &&
        v.metadata.toc &&
        v.metadata.toc.hasOwnProperty("index")) {
        return v.metadata.toc.index;
    }

    return true;
  });

  // Special case of no ToC
  if (Object.keys(content).length === 0) {
    return undefined;
  }

  // Generate a tree.
  var toc = fs2.dirToTree(content, {
        root: src
      }),
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
        if (row) {
          var newRow = {};
          var key = Object.keys(row)[0];
          newRow[key] = sorter(row, paths);
          return newRow;
        } else {
          return undefined;
        }
      });
    } else {
      return subtoc;
    }

  })[0]; // Note that the end result has a list inside of a list.
};
