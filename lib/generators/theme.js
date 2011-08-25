var findit  = require('findit'), 
    path    = require('path'),
    mkdirp  = require('mkdirp'),
    fs      = require('fs'),
    helpers = require('../helpers');
    
    
var theme = exports;

theme.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

theme.generate = function(files) {

  // write toc to file system
  console.log(Object.keys(files));
  Object.keys(files).forEach(function(filePath){
    var newPath = filePath.replace('./theme', '/../../public');
    newPath =  path.normalize(__dirname + newPath);
    //
    // Remark: Fire and Forget
    //
    helpers.writeFile(newPath, files[filePath], function(){});
  });

};

theme.load = function(data, dom) {
  
  // load the theme

  // Filter out the weld templates for now
  var filterTemplates = function (file) {
    
    // TODO: refactor this block, 
    // we should have a better idea of weld tempaltes, not an array 
    var templates = ['index.html', 'toc.html', 'article.html'];
    if(templates.indexOf(path.basename(file)) !== -1){
      return false;
    } else {
      return true;
    }
  };

  var theme = helpers.readDir('./theme', true, filterTemplates);

  
  return theme;
  
};