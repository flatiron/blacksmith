var smith = require('../blacksmith'),
    buildToc = require('../toc').buildToc;

var toc = exports;

// Build the Table of Contents.
toc.load = function(data, dom) {
  return buildToc(smith.src);
};
