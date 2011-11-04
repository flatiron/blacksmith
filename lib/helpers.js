/*
 * helpers.js
 *
 * Contains helpers for the smith.
 *
 */
var helpers = exports;

var smith     = require("./blacksmith"),
    fs       = require('fs'),
    fs2      = require('./fs2'),
    findit   = require('findit'),
    path     = require('path'),
    Hash     = require('hashish'),
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
helpers.isElement = helpers.isElement = function(xs, e) {
    return -~xs.indexOf(e);
}


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

      var link = newParent;
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
        return helpers.unresolve(smith.src, p+"/"+file).replace(/^\./, '');
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
