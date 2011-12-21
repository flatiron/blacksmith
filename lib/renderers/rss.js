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
  Object.keys(smith.content.content).filter(function (file) {
    var metadata = smith.content.content[file].metadata;
    return metadata && (metadata.index !== false);
  }).forEach(function (file) {
    var content = smith.content.content[file],
        p = path.normalize(file.replace(path.resolve(smith.src), ''));

    dom.innerHTML = content.content;

    feed.item({
      title: content.metadata && content.metadata.title || smith.config.get("title") + " -- Untitled" || "Untitled",
      description: $(".content", dom).html(),
      url: 'http://' + smith.config.get("url") + p,
      author: content.metadata && content.metadata.author && content.metadata.author.name
        || smith.config.get("author") || "",
      date: (content.metadata && content.metadata.date) || new Date('January 1, 1970')
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
