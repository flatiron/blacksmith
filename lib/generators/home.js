var docs    = require('../docs'),
    weld    = require('weld').weld,
    markdown = require('github-flavored-markdown'),
    findit  = require('findit'),
    path    = require('path'),
    fs      = require('fs'),
    fs2      = require('../fs2'),
    helpers = require('../helpers');

var home = exports;


home.weld = function(dom, data) {
  
  var toc = helpers.buildToc(docs.src);

  dom.innerHTML = docs.content.theme['./theme/index.html'].toString();

  var data = { 
    toc: toc,
    readme: data
  };

  weld(dom, data, {
    map: function(parent, element, key, val) {
      element.innerHTML = val;
      return false;
    }
  });

  
  return dom;
  
};

home.generate = function(output, data) {
  // write index.html to file system
  var newPath = __dirname + '/../../public/index.html';
  fs2.writeFile(newPath, output, function(){});
};

home.load = function(data, dom) {
  var readme;
  try {
    readme = markdown.parse(fs.readFileSync('./README.md').toString());
  } catch (err) {
    console.log(err.stack);
  }
  return readme;
};
