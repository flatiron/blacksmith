var docs = require('../docs'),
    buildToc = require('../toc').buildToc;

var toc = exports;

toc.weld = function(dom, data) {
  
  // This is where a sitemap page would be built, if we generated one.
  return;
};

toc.generate = function(output, data) {

  // This is where the sitemap page would be written to disk, if we
  // generated one.
  return;
};

// Build the Table of Contents.
toc.load = function(data, dom) {
  return buildToc(docs.src);
};
