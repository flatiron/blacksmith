var findit = require('findit');

var article = exports;

article.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

article.generate = function(data, dom) {
  
  // write all articles
  
};


article.load = function() {
  
  // load all articles 
  var articles = findit.sync('./articles');

  //
  // Filter out all files
  //
  articles = articles.filter(function(a){
    a = a.replace('./articles', '');
    if(a.match(/\./)){
      return false;
    } else {
      return true;
    }
  });
  
  //
  // Generate articles html
  //
  articles.forEach(function(a){
    a = a.replace('./articles', '');
  });
  
  return articles;
  
};