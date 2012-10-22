var smith   = require("../blacksmith"),
    fs2      = require('../fs2'),
    winston = require('winston'),
    prompt  = require("prompt");

module.exports = function() {
  winston.info("Executing command "+"post".yellow);

  var defaultAuthor = smith.config.get("defaultAuthor"),
      defaultAuthorName;
  var existsSync = fs.existsSync ? fs.existsSync : require('path').existsSync;
  if(defaultAuthor && existsSync('./authors/'+defaultAuthor+'.json')) {
    var author = require("../loaders/authors").load(true)[defaultAuthor];
    if(author) {
      defaultAuthorName = author.get("name");
    }
  }

  prompt.start();
  prompt.get([
    {
      name: "title",
      message: "Name the blog post"
    },
    {
      name: "author",
      message: "Specify the author" + (defaultAuthorName ? " (empty to use '"+defaultAuthorName+"')" : "")
    }
  ], function (err, res) {
    if (err) {
      winston.error(err.stack);
      cb(1);
    }

    if(res.author === "") {
      res.author = defaultAuthorName;
    }

    var folder = res.title.toLowerCase().replace(/\W+/g, '-');

    //TODO: Check authors

    winston.warn('blacksmith'.yellow+' is about to write '
      + ('`./'+folder+'/page.json`').yellow + ' and '
      + ('`./'+folder+'/content.md`').yellow + '!'
    );

    prompt.get([{
      name: 'okay',
      message: 'Is this okay? [y/N]'
    }], function (err, j) {
      if (err) {
        throw err;
      }


      if (j.okay && (j.okay[0] == 'y' || j.okay[0] == 'Y') ) {

        // Write the files.
        fs2.writeFile(folder + "/page.json", JSON.stringify({
          title: res.title,
          author: res.author,
          date: new Date()
        }, true, 2), function (err) {
          if (err) {
            throw err;
          }
          winston.info("* Created " + ("`./"+folder+"/page.json`.").yellow);

          fs2.writeFile(folder + "/content.md", "Dear diary,\n\n\n", function (err) {
            if (err) {
              throw err;
            }
            winston.info("* Created "+("`./"+folder+"/content.md`.").yellow);
          });
        });

      }
    });

  });
}
