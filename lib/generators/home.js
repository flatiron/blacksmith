var docs = require('../docs');

var home = exports;

var fs = require('fs');

home.weld = function(dom, data) {
  
  // perform weld
  
  return data;
  
};

home.generate = function(output) {
  // write home to file system
  //fs.writeFileSync('./public/index.html', JSON.stringify(output, true, 2));
};

home.load = function(data, dom) {
  return docs.content.article;
};