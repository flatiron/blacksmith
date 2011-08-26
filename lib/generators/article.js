var findit = require('findit'), 
    path   = require('path'),
    markdown = require('markdown'),
    mkdirp = require('mkdirp'),
    fs     = require('fs'),
    docs   = require('../docs'),
    weld   = require('weld').weld,
    helpers = require('../helpers');

var article = exports;

article.weld = function(dom, articles) {
  Object.keys(articles).forEach(function(i){
    var article;
    try {
      article = markdown.parse(articles[i].toString());
    } catch (err) {
      article = err.message;
    }
    var author = docs.content.authors;
    dom.innerHTML = docs.content.theme['./theme/article.html'].toString();
    var data = { author: author, article: article };
    weld(dom, data, {
      map: function(parent, element, key, val) {
        element.innerHTML = val;
        return false;
      }
    });
    articles[i] = dom.innerHTML;
  });
  return dom;
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


article.load = function () {
  
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
