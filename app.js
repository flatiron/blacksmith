var dnode = require('dnode'),
    fs = require('fs');

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

var server = dnode({
  getGuide: getGuide,
  getGuides: function (tagId, callback) {
    callback('v');
  },
  getTags : function(callback) {
    callback('a');
  }
});
server.listen(5050);
