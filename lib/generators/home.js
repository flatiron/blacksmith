var docs = require('../docs');

var home = exports;

var fs = require('fs');

home.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

home.generate = function(output) {
  // write home to file system
  //output = docs.helpers.filesToTree(output);
  fs.writeFileSync('./public/index.html', JSON.stringify(output, true, 2));
};

home.load = function(data, dom) {
  return docs.content.article;
};