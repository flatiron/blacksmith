/*
 * rss.js: Methods for generating an rss feed.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith = require('../blacksmith'),
    Rss = require('rss'),
    path = require('path'),
    fs2 = require('../fs2');

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

  var newPath =  path.resolve("./public/feed.xml");

  smith.log.info("Writing " + newPath);

  fs2.writeFile(newPath, xml, function(){});
};
