var docs = require('../docs'),
    findit  = require('findit'), 
    path    = require('path'),
    mkdirp  = require('mkdirp'),
    fs      = require('fs'),
    fs2     = require('../fs2'),
    helpers = require('../helpers');
    
    
var theme = exports;

theme.weld = function(dom, data) {
  
  // perform weld
  return data;
  
};

theme.generate = function(output, files) {

  Object.keys(files).forEach(function(filePath){
    // Filter out the weld templates for now
    // TODO: refactor this block,
    // we should have a better idea of weld tempaltes, not an array
    var templates = ['index.html', 'toc.html', 'article.html'];
    if(templates.indexOf(path.basename(filePath)) !== -1){
      return;
    }

    var newPath = docs.src + "/../public/" + filePath;
    //newPath =  path.normalize(__dirname + newPath);
    //
    // Remark: Fire and Forget
    //
    fs2.writeFile(newPath, files[filePath], function (){ });
  });

};

theme.load = function() {
  
  // load the theme

  var _theme = fs2.readDirSync(docs.src + '/../theme', true, function (p) {
    return !fs.statSync(p).isDirectory();
  });

  var theme = {};

  Object.keys(_theme).forEach(function (k) {
    var newK = helpers.unresolve(docs.src + '/../theme', k);
    theme[newK] = _theme[k];
  });

  return theme;
  
};
