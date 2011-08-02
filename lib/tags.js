var async = require('async'),
    fs = require('fs');

var generate_tag_data_ = function (callback) {
  fs.readdir('topics/', function (err, results) {
    if (err) {
      return callback(err);
    }
    var tags = {};
    var iter = function(dir, callback) {
      fs.readFile('topics/' + dir + '/metadata.json', 'utf8', function(err, json) {
        if (err) {
          return callback(err);
        }

        try {
          var obj = JSON.parse(json);
        }
        catch (e) {
          e.file = dir+'/metadata.json';
          console.log(e);
          return callback(e);
        }

        for (var i = 0; i < obj.tags.length; ++i) {
          var tag = obj.tags[i];
          if (tags[tag] == undefined) {
            tags[tag] = [];
          }
          tags[tag].push(dir);
        }
        return callback();
      });
    }

    async.forEach(results, iter, function (err) {
      if (err) {
        exports.error = err;
        return callback({});
      }
      exports.error = undefined;
      return callback(tags);
    });
  });
};

generate_tag_data = function () {
  generate_tag_data_(function (tags) {
    exports.tagid = tags;
    var temp = [];
    var tag;
    for (tag in tags) {
      temp.push(tag);
    }
    exports.names = temp;
    return setTimeout(generate_tag_data, 1000);
  });
};
generate_tag_data();
exports.tagid = {};
exports.names = [];
exports.error = null;
