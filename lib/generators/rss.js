/*
 * rss.js: Methods for generating an rss feed.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = require('../blacksmith'),
    Rss     = require('rss'),
    fs2      = require('../fs2');

var rss = exports;

rss.weld = function (dom, feed) {
  var $ = smith.window.$;

  // Welding, in this case, is a misnomer. In this case, we use the generated
  // content to populate the rss feed.
  Object.keys(smith.content.content).forEach(function (k) {
    var content = smith.content.content[k];

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

rss.generate = function (output, data) {
  // Write rss.xml to disk.
  var xml = data.xml();

  var newPath = __dirname + '/../../public/rss.xml';
  fs2.writeFile(newPath, xml, function(){});
};


// Loading, in this case, consists of initializing the rss object.
// Most of the information comes from the top-level config.
rss.load = function () {
  return new Rss({
    title: smith.config.get("title") || "",
    description: smith.config.get("description") || "",
    feed_url: '/rss.xml',
    site_url: smith.config.get("url") || "",
    author: smith.config.get("author") || ""
  });
};
