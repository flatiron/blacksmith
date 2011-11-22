var smith   = require("../blacksmith"),
    fs      = require('fs'),
    winston = require('winston'),
    prompt  = require("prompt");

module.exports = function() {
  winston.info("Executing command "+"post".yellow);

  prompt.start();
  prompt.get([
    {
      name: "title",
      message: "Name the blog post"
    },
    {
      name: "author",
      message: "Specify the author"
    }
  ], function (err, res) {
    if (err) {
      winston.error(err.stack);
      cb(1);
    }

    //TODO: Check authors

    winston.warn('blacksmith'.yellow+' is about to write '+'`./page.json`'.yellow+ ' and '+'`./content.md`'.yellow+'!');

    prompt.get([{
      name: 'okay',
      message: 'Is this okay? [y/N]'
    }], function (err, j) {
      if (err) {
        throw err;
      }


      if (j.okay && (j.okay[0] == 'y' || j.okay[0] == 'Y') ) {

        // Write the files.
        fs.writeFile("page.json", JSON.stringify({
          title: res.title,
          author: res.author,
          date: new Date()
        }, true, 2), function (err) {
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

      }
    });

  });
}
