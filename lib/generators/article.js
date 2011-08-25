var findit = require('findit'), 
    path   = require('path'),
    mkdirp = require('mkdirp'),
    fs     = require('fs');

var article = exports;

article.weld = function(data, dom) {
  
  // perform weld
  
  return dom;
  
};

article.generate = function(articles) {
  
   //
   // Generate all articles
   //
   var _articles = {};

   console.log(articles);

   articles.forEach(function(a){
     //_articles[a] = markdown.parse(fs.readFileSync(a).toString());

     _articles[a] = fs.readFileSync(a).toString();

     var newPath = a.replace('./articles/', './public/articles/');
     var fileDir  = path.normalize(__dirname + '../../.' + newPath);
     fileDir = path.dirname(fileDir);
     
     var filePath = path.normalize(path.dirname(newPath));
     filePath = './' + filePath + '/index.html';

     console.log(fileDir);
     console.log(filePath);

     //
     //  Remark: Fire and forget situation here
     //
     (function(b){
       mkdirp(fileDir, 0755, function(err){
         if(err){
           console.log(err);
         }
         fs.writeFileSync(filePath, b);
       });
     })(_articles[a])

   });
  
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
    

  return articles;
  
};