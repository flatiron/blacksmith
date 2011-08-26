var docs = require('../docs');

var home = exports;

var fs = require('fs');

home.weld = function(dom, data) {
  
  // perform weld
  
  return dom;
  
};

home.generate = function(output, data) {
  // write index.html to file system
  //fs.writeFileSync('./public/index.html', JSON.stringify(output, true, 2));
};

home.load = function(data, dom) {
  return docs.content.article;
};
