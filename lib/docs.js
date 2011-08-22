/*
 * Docs - Top-level include for the docs project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var docs   = {},
    traverse = require('traverse'),
    path     = require('path'),
    markdown = require('markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    findit   = require('findit');

docs = exports;

docs.generateTOC = function () {
  
  var articles = docs.getArticles();
  
  return treeToHTML(filesToTree(articles));
  
};

docs.getArticles = function () {
  
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

docs.getArticlesMarkdown = function () {

  var articles = findit.sync('./articles');

   //
   // Filter out all files
   //
   articles = articles.filter(function(a){
     a = a.replace('./articles', '');
     if(a.match(/\.md/)){
       return true;
     } else {
       return false;
     }
   });

   //
   // Generate articles html
   //
   var _articles = {};
   
   articles.forEach(function(a){
     _articles[a] = markdown.parse(fs.readFileSync(a).toString());
     
     var newPath = a.replace('./articles/', './public/articles/');
     var fileDir  = path.normalize(__dirname + '/.' + newPath);
     fileDir = path.dirname(fileDir);
     var filePath = path.normalize(path.dirname(newPath));
     filePath = './' + filePath + '/index.html';
     
//     filePath = __dirname + '/.' + filePath;
     console.log(fileDir);
     console.log(filePath);


     (function(b){
       mkdirp(fileDir, 0755, function(err){
         if(err){
           console.log(err);
         }
         fs.writeFileSync(filePath, b);
       });
       
     })(_articles[a])
     
     
     
   });
   
   
   
   
   return _articles;
}

var filesToTree = function(files){
  
  files = files.reduce(function (acc, file) { 
    var ps = file.split('/');
    traverse(acc).set(ps, {});
    return acc;
  }, {});
  
  return files;
  
}

var treeToHTML = function (tree, depth) {
  if (depth === undefined) {
    depth = 0;
  }
  var str = ""
  for (key in tree){
    switch(typeof tree[key]) {
      case 'string':
        str += "<li><a href='#' onclick='loadArticle(\""+tree[key]+"\")'>"+tree[key]+"</a></li>";
        break;
      case 'object':
        var html = "h" + (depth+1) + ">";
        str +=  "<ul><"+html + key + "</"+html + treeToHTML(tree[key], depth+1) + "</ul>";
    }
  }
  return str;
}
