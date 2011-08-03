var async = require('async'),
    fs = require('fs');
    articles = require('./articles');

exports.tagid = {};
exports.names = [];

// this generated the tags structure
exports.regenerate_tag_data = function () {
  // reset the old data without setting the variable (so we reference the same object)
  exports.names.length = 0
  for (name in exports.tagid) {
    delete exports.tagid[name];
  }

  for (article in articles) {
    if ( articles[article].metadata === undefined) {
      console.log(article, 'has no `metadata.json` file');
      continue;
    }

    if ( articles[article].article === undefined) {
      console.log(article, 'has no `article` file');
      continue;
    }

    // for each tag, add the article to the list of articles that reference it
    var tags = articles[article].metadata.tags;
    for(var i = 0; i < tags.length; ++i) {
      if (exports.tagid[tags[i]] === undefined) {
        exports.tagid[tags[i]] = [];
      }
      exports.tagid[tags[i]].push(article);
    }
  }

  // generate a list of tags
  for (tag in exports.tagid) {
    exports.names.push(tag);
  }
};
