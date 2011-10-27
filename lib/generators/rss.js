var docs    = require('../docs'),
    weld    = require('weld').weld,
    Rss     = require('rss'),
    findit  = require('findit'),
    path    = require('path'),
    fs      = require('fs'),
    fs2      = require('../fs2'),
    helpers = require('../helpers');

var rss = exports;


rss.weld = function(dom, feed) {
  var $ = docs.window.$;

  Object.keys(docs.content.content).forEach(function (k) {
    var content = docs.content.content[k];

    dom.innerHTML = content.content;

    feed.item({
      title: content.metadata && content.metadata.title || "",
      description: $("#content", content.content).html(),
      author: content.metadata && content.metadata.author || "",
      date: content.metadata && content.metadata.date || new Date()
    });
  });

  return dom;
  
};

rss.generate = function(output, data) {
  // we want to write the rss out here
  var xml = data.xml();

  var newPath = __dirname + '/../../public/rss.xml';
  fs2.writeFile(newPath, xml, function(){});
};

rss.load = function(data, dom) {
  return new Rss({
    title: docs.config.get("title") || "My RSS Feed",
    description: docs.config.get("description") || "This is an RSS feed.",
    feed_url: '/rss.xml',
    site_url: 'http://docs.nodejitsu.com',
    author: docs.config.get("author")
  });
};
