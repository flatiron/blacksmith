var smith   = require("../blacksmith"),
    fs      = require('fs'),
    winston = require('winston'),
    prompt  = require("prompt");

module.exports = function() {
  prompt.start();
  prompt.get([ "title", "author" ], function (err, res) {
    if (err) {
      winston.error(err.stack);
      cb(1);
    }

    //TODO: Check authors

    fs.writeFile("page.json", JSON.stringify({
      title: res.title,
      author: res.author,
      date: new Date()
    }), function (err) {
      if (err) {
        throw err;
      }
      winston.info("* Created "+"`page.json`.".yellow);

      fs.writeFile("content.md", "Dear diary,\n\n\n", function (err) {
        if (err) {
          throw err;
        }
        winston.info("* Created "+"`content.md`.".yellow);
      });
    });
  });
}
