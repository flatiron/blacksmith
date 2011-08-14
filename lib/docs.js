/*
 * Docs - Top-level include for the docs project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var docs   = {},
    traverse = require('traverse'),
    findit = require('findit');

docs = exports;

docs.generateTOC = function () {
  
  var articles = findit.sync('./articles');
  
  articles = articles.filter(function(i){
    i = i.replace('./articles', '');
    if(i.match(/\./)){
      return false;
    } else {
      return true;
    }
  });
  
  return treeToHTML(filesToTree(articles));
  
};


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
