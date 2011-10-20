//
//  fs2.js
//

var fs2 = exports;

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    traverse = require('traverse'),
    findit = require('findit');

//
// Transform array into flat object
// Uses as a helper.
//
fs2.filesArrayToObject = function(files, resolve){
  var _files = {};
  files.forEach(function(file){
    var contents = '';
    if (resolve) {
      //
      // Remark: also read the contents of the file
      // and set it in memory on JSON object as binary data
      //
      var stat = fs.statSync(file);

      if (stat.isDirectory()) {
        contents = { "isDirectory": true };
      } else {
        contents = fs.readFileSync(file);
      }

    }
    _files[file] = contents;
  });
  return _files;
}

//
// Convert flat object of file paths into nested JSON object
//
fs2.filesToTree = function(files){
  
  files = files.reduce(function (acc, file) { 
    var ps = file.split('/');
    ps.splice(0,1);
    traverse(acc).set(ps, {});
    return acc;
  }, {});
  
  return files;
  
}


//
// Recursively read directory into flat JSON object
// arguments: path, resolve, filter
//
fs2.readDir = function (p, resolve, filter, cb) {

  if (!filter) {
    cb = resolve;
    resolve = false;
  } else if (!cb) {
    cb = filter;
    filter = null;
  }


  var files = [];

  // finder.find doesn't "do" errors-to-cb
  try {
    var finder = findit.find(p, function (f) {
      files.push(f);
    });

    finder.on("end", function () {
      if (typeof filter === 'function') {
        files = files.filter(filter);
      }

      cb(null, fs2.filesArrayToObject(files, resolve));

    });
  } catch (e) {
    cb(e);
  }
};


// Syncronous version of above.
fs2.readDirSync = function (p, resolve, filter) {

   var files = findit.sync(p);

   if( typeof filter === 'function') {
     //
     // Apply the fileMap method to the contents of each file 
     //
     files = files.filter(filter);
   }

   return fs2.filesArrayToObject(files, resolve);

};


//
// Forces a file write by using mkdirp to recurisvely build directories 
//
fs2.writeFile = function(filePath, contents, callback) {

  var fileDir = path.dirname(filePath);
  
  mkdirp(fileDir, 0755, function(err){
    if(err){
      callback(err);
    }
    fs.writeFile(filePath, contents, callback);
  });

};
