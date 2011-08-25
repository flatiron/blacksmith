var findit = require('findit'), 
    path   = require('path'),
    markdown = require('markdown'),
    mkdirp = require('mkdirp'),
    fs     = require('fs'),
    helpers = require('../helpers');

var article = exports;

article.weld = function(dom, data) {
  
  Object.keys(data).forEach(function(i){
    data[i] = markdown.parse(data[i]);
  });
  console.log(data);
  
  // perform weld
  return data;
  
};

article.generate = function(output, articles) {

  //
  // Generate all articles
  //
  Object.keys(articles).forEach(function(file){
    var newPath = file.replace('./articles', '/../../public/articles');
    newPath =  path.dirname(newPath);
    newPath =  path.normalize(__dirname + newPath + '/index.html');
    helpers.writeFile(newPath, articles[file], function(){});
  });

  return articles;
};


article.load = function() {
  
  // load all articles 
  var articles = findit.sync('./articles');

  //
  // Filter out all non-markdown files
  //
  articles = articles.filter(function(a){
    a = a.replace('./articles', '');
    if(a.match(/\.md/)){
      return true;
    } else {
      return false;
    }
  });
    
  return helpers.filesArrayToObject(articles, true);
  
};