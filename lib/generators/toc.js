var docs = require('../docs');

var toc = exports;

var fs = require('fs');

toc.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

toc.generate = function(output) {
  // write toc to file system
  output = docs.helpers.filesToTree(output);
  fs.writeFileSync('./public/toc.html', JSON.stringify(output, true, 2));
};

toc.load = function(data, dom) {
  return docs.content.article;
};