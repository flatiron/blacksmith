var async = require('async'),
    fs = require('fs'),
    findit = require('findit'),
    path = require('path');

var articles = {};
var generate_article_list = function (callback) {
  var finder = findit.find(__dirname+'/../articles'),
      done = false, current_requests = 0,
      errors = [];

  finder.on('file', function (file) {
    if (path.basename(file) === 'article.md') {
      var article_name = path.basename(path.dirname(file));
      ++current_requests;
      fs.readFile(file, 'utf8', function (err, data) {
        --current_requests;
        if (err) { errors.push(err); return; }
        articles[article_name] = articles[article_name] || {};
        articles[article_name].article = data;
        if (current_requests === 0 && done) {
          callback();
        }
      });
    }

    if (path.basename(file) === 'metadata.json') {
      var article_name = path.basename(path.dirname(file));
      ++current_requests;
      fs.readFile(file, 'utf8', function (err, data) {
        --current_requests;
        if (err) { errors.push(err); return; }
        articles[article_name] = articles[article_name] || {};

        try {
          var json = JSON.parse(data);
        } catch (e) {
          errors.push(new Error("Invalid json file: " + file));
          return;
        }

        articles[article_name].metadata = json;
        if (current_requests === 0 && done) {
          callback();
        }
      });
    }
  });

  finder.on('end', function () {
    done = true;
    if (current_requests === 0) {
      callback();
    }
  });
}

function article_generator() {
  generate_article_list(function () {
    setTimeout(article_generator, 60000);
  });
}
article_generator();

module.exports = articles;
