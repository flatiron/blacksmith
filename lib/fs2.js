/*
 * fs2.js
 *
 * Contains tools for reading in directories of data.
 *
 */

var fs2 = exports;

var fs       = require('fs'),
    path     = require('path'),
    mkdirp   = require('mkdirp'),
    traverse = require('traverse'),
    Hash     = require('hashish'),
    findit   = require('findit');

// This transforms a list of files (such as findit's output) into an object
// where the keys are file paths and values are file contents if "resolve" is
// set to "true" and an empty string otherwise.
fs2.filesArrayToObject = function( files, resolve ) {

  var _files = {};

  // Loop over the list of files and attach the result to _files as a key/value
  // pair.
  files.forEach( function (file) {
    var contents = '';

    if (resolve) {

      // Check to see if the path represents a directory or file.
      var stat = fs.statSync(file);

      if (stat.isDirectory()) {

        // This means that you can test for isDirectory with
        // dir[path].isDirectory
        contents = { "isDirectory": true };
      } else {

        // Read in the contents of the file.
        contents = fs.readFileSync(file);
      }

    }

    _files[file] = contents;

  });

  return _files;
}

// Convert a flat list of directories (ie, output from findit)
// into a tree of the form:
//
//     { "foo": {"bar": {} } }
//
fs2.filesToTree = function(files){
  
  files = files.reduce(function (acc, file) { 

    // Splits the file path into a list.
    // Also takes care of double slashes to avoid blank keys.
    var ps = file.replace('//', '').split('/');

    // Filter out dot-paths.
    ps = ps.filter(function (e) {
      return e !== "."
    });

    // Use traverse to set acc[p[0]][p[1]]...[p[n-1]] to {}.
    // Traverse takes care of creating necessary objects.
    traverse(acc).set(ps, {});
    return acc;
  }, {});

  return files;
  
}


// Convert a flat directory object (such as that output by filesArrayToObject)
// into a tree of the form:
//
//     { "foo": {"bar": {} } }
//
fs2.dirToTree = function (dir) {

  // Same as filesToTree, except we use Object.keys which is equivalent to the
  // original list of files.
  return fs2.filesToTree(Object.keys(dir));

}


// orderedTree takes a nested tree (such as that output by dirToTree) and
// transforms it into a structure of the form:
//
//     [ { "foo": [ { "bar": {} ] }]
//
// The conversion from a hash with multiple keys into a list of hashes with
// single keys gives our structure a sense of ordering.
fs2.orderedTree = function (tree) {

  // This function is called recursively with the tree.
  function ordered (tree) {

    // Take each subtree in the hash and replace it with an ordered subtree.
    var subtrees = Hash(tree).map(function (v) {
          return ordered(v);
        }).items,
        _tree = [];

    // This tree still needs to be ordered itself!
    Object.keys(subtrees).forEach(function(k) {
      var obj = {};

      // Obj only has one key/value pair.
      obj[k] = subtrees[k];

      // Push this key/value pair onto our list.
      _tree.push(obj);
    });

    return _tree;
  }

  // Call it!
  return ordered(tree);
}

// Reads in an entire directory and converts it into an object
// where the keys are file paths and the values are file contents if "resolve"
// is set to "true" (and an empty string otherwise).
//
// Arguments:
//
// * path: The path of the directory
// * resolve [optional]: If set to "true," file contents are set to their
//     corresponding values.
// * filter(element) [optional]: If defined, output of findit is filtered using
//     this function.
// * callback(err, result)
fs2.readDir = function (p, resolve, filter, cb) {

  // Since resolve and filter are optional, we need to handle the cases where
  // not every argument is defined.
  if (!filter) {
    cb = resolve;
    resolve = false;
  } else if (!cb) {
    cb = filter;
    filter = null;
  }


  var files = [],
      finder;

  // Finder throws errors instead of passing them, so we use a "try" to funnel
  // any errors to the callback.
  try {
    finder = findit.find(p, function (f) {
      // This gets called for each individual file. Here we collect them all.
      files.push(f);
    });

    // Once finder is done, we can finish up.
    finder.on("end", function () {
      // Apply the filter, if any.
      if (typeof filter === 'function') {
        files = files.filter(filter);
      }

      // Convert the list from findit into an object structure.
      cb(null, fs2.filesArrayToObject(files, resolve));

    });
  } catch (e) {
    cb(e);
  }
};


// This is the syncronous version of readDir. It does not take a callback and
// throws its errors, but is otherwise equivalent.
fs2.readDirSync = function (p, resolve, filter) {

   // findit.sync returns a list of directories already.
   var files = findit.sync(p);

   if ( typeof filter === 'function') {
     // Apply the filter, if any.
     files = files.filter(filter);
   }

   // Convert the list from findit into an object structure.
   return fs2.filesArrayToObject(files, resolve);

};


// fs2.writeFile forces a file write by using mkdirp to recurisvely build
// directories. Otherwise, the API mirrors that of fs.writeFile.
fs2.writeFile = function(filePath, contents, callback) {

  var fileDir = path.dirname(filePath);
  
  mkdirp(fileDir, 0755, function(err){
    if (err) {
      callback(err);
    }
    fs.writeFile(filePath, contents, callback);
  });

};
