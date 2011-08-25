//
//  helpers.js
//

var helpers = exports;

var traverse = require('traverse');

//
// TODO: Recursively read directory into flat JSON object
// arguments: path, resolve, fileMap
//

/*

  if( resolve ) { 
    // also read the contents of the file and set it in memory on JSON object
  }
  
  if( _map ) {
    // apply the fileMap method to the contents of each file 
  }

*/

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


