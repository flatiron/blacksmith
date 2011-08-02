var dnode = require('dnode'),
    fs = require('fs'),
    connect = require('connect'),
    markdown = require('markdown');

var tags = require('../lib/tags');

getGuide = function (name, callback) {
  fs.readFile('topics/'+name+'/article.md', 'utf8', function (err, article) {
    if (err) {
      return callback(err);
    }
    fs.readFile('topics/'+name+'/metadata.json', 'utf8', function (err, json) {
      if (err) {
        return callback(err);
      }
      try {
        context = JSON.parse(json);
      }
      catch (e) {
        return callback(new Error('Error parsing metadata.json'));
      }
      context.content = markdown.parse(article);
      return callback(null, context);
    });
  });
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
