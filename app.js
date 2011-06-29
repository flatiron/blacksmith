var dnode = require('dnode'),
    fs = require('fs');

var tags = require('./tags');

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
      context.content = article
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

var server = dnode({
  getGuide: getGuide,
  getGuides: getGuides,
  getTags: getTags
});
server.listen(8080);
