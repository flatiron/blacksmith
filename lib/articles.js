var async = require('async'),
    fs = require('fs'),
    findit = require('findit'),
    path = require('path'),
    tags = require('./tags');

// Holds all the articles in this manner:
// <article name:> {
//    article: <article data>,
//    metadata: <metadata obj>
var articles = {};

// This sets up the article object
// NOTE: if this is ever taking too much memory, the solution is to create a set of `getter`s,
//  that grab from a cache and the hard directory on cache misses. Unlikely to become an issue though.
var generate_article_list = function (callback) {
  var finder = findit.find(__dirname+'/../articles'),
      done = false, current_requests = 0,
      errors = [];

  //When there are no pending requests and the `end` event has been emitted,
  // call the callback
  var finish = function () {
    if (current_requests === 0 && done) {
      if (errors.length === 0) {
        errors = null;
      }
      callback(errors);
    }
  }

  // Tranverse the `articles` directory and for each file:
  finder.on('file', function (file) {

    // if its an article,
    //   get the article name which is the directory the file is in
    //   read the file and set `articles[name].article = file`
    if (path.basename(file) === 'article.md') {
      var article_name = path.basename(path.dirname(file));
      ++current_requests;
      fs.readFile(file, 'utf8', function (err, data) {
        --current_requests;
        if (err) {
          errors.push(err);
          return finish();
        }
        articles[article_name] = articles[article_name] || {};
        articles[article_name].article = data;
        articles[article_name].path = path.dirname(path.normalize(file).replace(path.normalize(__dirname+"/../articles"), ""));
        finish()
      });
    }

    // if its metadata,
    //   get the article name which is the directory the file is in
    //   read+parse the file and set `articles[name].metadata = file`
    if (path.basename(file) === 'metadata.json') {
      var article_name = path.basename(path.dirname(file));
      ++current_requests;
      fs.readFile(file, 'utf8', function (err, data) {
        --current_requests;
        if (err) {
          errors.push(err);
          return finish();
        }
        articles[article_name] = articles[article_name] || {};

        try {
          var json = JSON.parse(data);
        } catch (e) {
          errors.push(new Error("Invalid json file: " + file));
          return finish();
        }

        articles[article_name].metadata = json;
        finish();
      });
    }
  });

  finder.on('end', function () {
    done = true;
    finish();
  });
}

//Regenerate article data once a minute
var article_generator = function () {
  generate_article_list(function (err) {
    if (err) {
      console.log(err);
    }
    tags.regenerate_tag_data();
    setTimeout(article_generator, 60000);
  });
}
article_generator();

module.exports = articles;
