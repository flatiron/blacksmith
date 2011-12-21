var smith = require('../blacksmith'),
    buildToc = require('../toc').buildToc;

var toc = exports;

// Build the full Table of Contents.
// This is done here so that we only have to generate it once.
// Other contents listings are handled as they come.
toc.load = function(data, dom) {
  return buildToc(smith.src);
};
