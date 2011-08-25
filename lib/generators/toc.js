var toc = exports;

var fs = require('fs');

toc.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

toc.generate = function(output) {
  
  // write toc to file system
  fs.writeFileSync('../../public/toc.html', output);
  
};

toc.load = function(data, dom) {
  return {};
};