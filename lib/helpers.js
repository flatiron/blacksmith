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
  return path.resolve(abs).replace(path.resolve(base), ".");
}

// Test to see if `e` is an element of `xs`.
//
// xs.indexOf(e) returns -1 on no match, and the element's index otherwise.
// -~x is truthy if x is non-negative.
helpers.isElement = helpers.isElement = function(xs, e) {
    return -~xs.indexOf(e);
}

helpers.formatDate = function (date) {
  var day, month, date, year;
  try {
    dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ][date.getDay()];

    month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ][date.getMonth()];
    dayOfMonth = date.getDate();
    year = date.getFullYear();

    return dayOfWeek+", "+month+" "+dayOfMonth+" "+year;
  } catch (e) {
    console.log("Error formatting date "+date);
    return date;
  }
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
      var newParent = parent || (smith.config.get('path') || "");
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

// Feed email, return gravatar
helpers.gravatar = function (email, opts) {
  var size = (opts && opts.size) || '200',
      crypto = require('crypto'),
      md5 = crypto.createHash('md5')
        .update(String(email).trim().toLowerCase())
        .digest('hex');

  return "http://www.gravatar.com/avatar/"
    + md5 + "?r=pg&s="
    + size + ".jpg&d=identicon";
}

// Takes a directory, does some slicing/dicing to consolidate information and
// handle defaults. This is used in tandem with the "content" generator.
//
// Arguments:
// * src: The path to the source directory.
// * files: The "dir" structure
// * resolve [optional]: If truthy, attaches markdown content.
//
// Returns:
//
//
// keys: full directory path
// vals: {
//   metadata: {}, // from ./page.json
//   content: {}, // from ./content.md
//   ls: [], // listings
//   files: [] // binary files with no special considerations
// }
//
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
    smith.log.silly('Assembling content resource for directory '+p);
    if (!content[p]) {
      content[p] = {};
    }

      // Listings for directory views and the like.
      content[p].ls = fs.readdirSync(p).filter(function (file) {
        return (file !== "content.md")
          && (file !== "page.json");
      }).map(function(file) {
        var key = helpers.unresolve(smith.src, p+"/"+file).replace(/^\./, '');
        smith.log.silly('Using key '+key+' for directory listing of '+p);
        return key;
      });

    // If the file is a page.json, load the metadata and attach it.
    if (path.basename(f) === "page.json") {
        smith.log.silly('Attaching '+f+' to content resource '+p+' as metadata');
      try {
        content[p].metadata = JSON.parse(files[f]);
      } catch (e) {
        // If there's a page.json and it doesn't load, it's probably a mistake.
        throw new Error('File ' + f + ' does not contain valid json!');
      }

      // Some basic sanity checks on the metadata.
      if (typeof content[p].metadata.date !== 'undefined') {
        // I wanted a closure since this is a pretty long function.
        (function () {
          var date = content[p].metadata.date;
              date = new Date(date);

          if (date === 'Invalid Date') {
            smith.log.warn(p + "/page.json contains an invalid datestring.");
          }
          else {
            content[p].metadata.date = date;
          }
        })();
      }

      content[p].metadata.link = p;

      // Build up a "breadcrumb" by splitting the path and cleaning it up.
      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p].metadata.breadcrumb.slice(2, content[p].metadata.breadcrumb.length);

      smith.log.silly('Attaching metadata.breadcrumb '+content[p].metadata.breadcrumb.join('/')+' to content resource '+p);

    } // If the file is a content.md, load and attach the markdown.
    else if (path.basename(f) === "content.md") {
      if (!content[p]) {
        content[p] = {};
      }

      if (resolve) {
        smith.log.silly('Attaching '+f+' to content resource '+p+' as "content"');
        content[p].content = files[f].toString();
      } else {
        smith.log.silly('resolve == false; Not loading '+f+' for content resource '+p);
        content[p].content = "";
      }
      
    } // If the file is a directory instead, we still need breadcrumbs.
    else if (fs.statSync(f).isDirectory()) {
      if (!content[p]) {
        content[p] = {};
      }

      // Build up a "breadcrumb" as before.
      if (!content[p].metadata) {
        content[p].metadata = {};
      }

      content[p].metadata.breadcrumb = p.replace(path.dirname(src), "").split("/");
      content[p].metadata.breadcrumb = content[p]
        .metadata
        .breadcrumb
        .slice(2, content[p].metadata.breadcrumb.length);

      smith.log.silly('Attaching metadata.breadcrumb '+content[p].metadata.breadcrumb.join('/')+' to content resource '+p);

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
        smith.log.silly('Attaching file '+f+' to content resource '+p+' as "file"');
        content[p].files[path.basename(f)] = files[f];
      }
    }

  });

  return content;
}
