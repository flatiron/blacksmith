var RSS = require('rss');

// options uses node-rss options https://github.com/dylang/node-rss
module.exports = function(options){
  var feed = new RSS(options);
  return feed;
}
