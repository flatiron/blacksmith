var dnode = require('dnode'),
    fs = require('fs'),
    connect = require('connect'),
    markdown = require('markdown');

var tags = require('../lib/tags'),
    articles = require('../lib/articles');

var getGuide = function (name, callback) {
  var obj = articles[name].metadata;
  obj.content = markdown.parse(articles[name].article);

  callback(null, obj);
}

var getGuides = function (tagId, callback) {
  if (tags.error) {
    return callback(tags.error);
  }
  else if (tags.tagid[tagId] == undefined) {
    return callback("Undefined tag");
  }
  else {
    return callback(null, tags.tagid[tagId]);
  }
}

var getTags = function (callback) {
  if (tags.error) {
    return callback(tags.error);
  }
  else {
    return callback(null, tags.names);
  }
}

var server = connect.createServer();
server.use(connect.static(__dirname+"/../public"));
server.listen(8080);
console.log("http://localhost:8080/");

dnode({
  getGuide: getGuide,
  getGuides: getGuides,
  getTags: getTags
}).listen(server);
