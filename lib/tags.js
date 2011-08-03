var async = require('async'),
    fs = require('fs');
    articles = require('./articles');

exports.tagid = {};
exports.names = [];
exports.error = null;

var generate_tag_data_ = function () {
  exports.names.length = 0

  for (name in exports.tagid) {
    delete exports.tagid[name];
  }

  for (article in articles) {
    if ( articles[article].metadata === undefined)
      console.log(article);

    var tags = articles[article].metadata.tags;
    for(var i = 0; i < tags.length; ++i) {
      if (exports.tagid[tags[i]] === undefined) {
        exports.tagid[tags[i]] = [];
      }
      exports.tagid[tags[i]].push(article);
    }
  }

  for (tag in exports.tagid) {
    exports.names.push(tag);
  }
};

generate_tag_data = function () {
  generate_tag_data_();
  return setTimeout(generate_tag_data, 1000);
};
generate_tag_data();
