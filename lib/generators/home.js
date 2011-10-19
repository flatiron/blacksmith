var docs    = require('../docs'),
    weld    = require('weld').weld,
    markdown = require('github-flavored-markdown'),
    findit  = require('findit'),
    path    = require('path'),
    pf      = require('pathfinder'),
    helpers = require('../helpers');

var home = exports;

var fs = require('fs');

home.weld = function(dom, data) {

    var p = helpers.unresolve(path.resolve(__dirname + "/../.."), docs.src);

    var _articles = findit.sync(p);

    //
    // Filter out all non-markdown files
    //
    _articles = _articles.filter(function(a){
      a = path.resolve(a);
      if(a.match(/\./)){
        return false;
      } else {
        return true;
      }
    });
  
  var toc = helpers.filesToTree(_articles);
  toc = helpers.treeToHTML(toc);

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
  pf.writeFile(newPath, output, function(){});
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
