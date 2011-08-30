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

   return helpers.filesArrayToObject(files, resolve);

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
    ps.splice(0,1);
    traverse(acc).set(ps, {});
    return acc;
  }, {});
  
  return files.articles;
  
}

helpers.treeToHTML = function(values, parent) {

   var str = '<ul>';

   for(var key in values){

     if(typeof values[key]=='object' && values[key] != null){
       var newParent = parent || '';
       newParent = newParent + '/' + key;
       var link = '/articles' + newParent;
       str+='<li><a href="' + link + '">'+key.replace(/-/g, ' ')+'</a>' +helpers.treeToHTML(values[key], newParent)+'</li>';
     }
    }

   str+='</ul>';

   if(str === "<ul></ul>"){
     return '';
   }
   return str;
};


//
// Transform array into flat object
//
helpers.filesArrayToObject = function(files, resolve){
  var _files = {};
  files.forEach(function(file){
    var contents = '';
    if(resolve) {
      //
      // Remark: also read the contents of the file
      // and set it in memory on JSON object as binary data
      //
      contents = fs.readFileSync(file);
    }
    _files[file] = contents;
  });
  return _files;
}

//
// Transform articles array into flat object
//
helpers.articlesArrayToObject = function(files, resolve){
  var _files = {};
  files.forEach(function(file){
    var data = {
      content: '',
      metadata: {}
    };
    if(resolve) {
      //
      // Remark: also read the contents of the file
      // and set it in memory on JSON object as binary data
      //
      data.content  = fs.readFileSync(file);
      // TODO: Add better error handling for metadata
      data.metadata = JSON.parse(fs.readFileSync(path.dirname(file) + '/metadata.json').toString())

      // TODO: remove string concatentation and replace with proper weld
      data.metadata.link       = path.dirname(file);
      data.metadata.breadcrumb = path.dirname(file).split('/');
      data.metadata.breadcrumb = data.metadata.breadcrumb.splice(1, data.metadata.breadcrumb.length);

    }
    _files[file] = data;
  });
  return _files;
}