var docs    = require('../docs'),
    weld    = require('weld').weld,
    findit  = require('findit'),
    helpers = require('../helpers');

var home = exports;

var fs = require('fs');

home.weld = function(dom, data) {

  // load all articles 
  var _articles = findit.sync('./articles');

  //
  // Filter out all non-markdown files
  //
  _articles = _articles.filter(function(a){
    a = a.replace('./articles', '');
    if(a.match(/\./)){
      return false;
    } else {
      return true;
    }
  });
  
  var toc = helpers.filesToTree(_articles);
  
  dom.innerHTML = docs.content.theme['./theme/index.html'].toString();

  var data = { 
    toc: toc
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
  fs.writeFileSync('./public/index.html', output);
};

home.load = function(data, dom) {
  return docs.content.article;
};
