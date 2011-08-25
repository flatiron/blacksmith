//
//  helpers.js
//

var helpers = exports;

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    traverse = require('traverse'),
    findit = require('findit');

//
// Recursively read directory into flat JSON object
// arguments: path, resolve, fileMap
//

helpers.readDir = function (path, resolve, filter) {

   var files = findit.sync(path);

   if( typeof filter === 'function') {
     //
     // Apply the fileMap method to the contents of each file 
     //
     files = files.filter(filter);
   }

   //
   // Filter out all non-files
   //
   files = files.filter(function(a){
     a = a.replace('.', '');
     if(a.match(/\./)){
       return true;
     } else {
       return false;
     }
   });

   //
   // Transform array into flat object
   //
   var _files = {};
   files.forEach(function(file){
     
     var contents = '';
     
     if(resolve) { 
       // also read the contents of the file and set it in memory on JSON object
       contents = fs.readFileSync(file);
     }
     
     _files[file] = contents;
   });


   return _files;

};

//
// Forces a file write by using mkdirp to recurisvely build directories 
//
helpers.writeFile = function(filePath, contents, callback) {

  var fileDir = path.dirname(filePath);
  
  mkdirp(fileDir, 0755, function(err){
    if(err){
      console.log(err);
      callback(err);
    }
    fs.writeFile(filePath, contents, callback);
  });

};


//
// Convert flat object of file paths into nested JSON object
//
helpers.filesToTree = function(files){
  
  files = files.reduce(function (acc, file) { 
    var ps = file.split('/');
    traverse(acc).set(ps, {});
    return acc;
  }, {});
  
  return files;
  
}


