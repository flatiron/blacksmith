var smith   = require("../blacksmith"),
    fs      = require('fs'),
    winston = require('winston'),
    cp      = require('ncp').ncp,
    prompt  = require("prompt");

module.exports = function () {

  var argv = Array.prototype.slice.call(arguments);

  // I can't pass this in as an extra argument through flatiron.cli ?
  //var sitename = "blog";

  winston.info("Executing command "+"init".yellow);

  smith.sites(function (err, sites) {

    if (err) {
      throw err;
    }

    Object.keys(sites).forEach(function (k) {
      try {
        sites[k] = {
          "description": JSON.parse(fs.readFileSync(sites[k]+'/package.json').toString()).description,
          "path": sites[k]
        }
      }
      catch (err) {
        winston.warn(err.message);
        sites[k] = {
          "path": sites[k],
          "description": '<No description found>'
        };
      }
    });

    prompt.start();

    var getType = function getType (cb) {
      winston.help('init'.yellow + ' can create any of these site types:');
      winston.help('');
      Object.keys(sites).forEach(function (site) {
        winston.help('    * '+site.yellow+ ': '+sites[site].description);
      });
      winston.help('');

      prompt.get([{
        name: 'type',
        message: 'Choose your website type'
      }], function (err, i) {
        if (err) {
          return cb(err);
        }

        if (sites.hasOwnProperty(i.type)) {
          winston.info('Selecting website type '+i.type.yellow+'...');
          cb(null, i.type);
        }
        else {
          winston.error('That\'s not a website type! Try again.');
          getType(cb);
        }
      });
    };

    getType(function (err, type) {
      if (err) {
        throw err;
      }


      prompt.get([{
          name: 'sitename',
          message: 'Name your website'
      }], function (err, i) {

        if (err) {
          throw err;
        }

        var sitename = i.sitename;

        winston.warn('blacksmith'.yellow+' is about to write a '+type.yellow+' site to '+ ('./'+sitename).yellow + '!');
        prompt.get([{
          name: 'okay',
          message: 'Is this okay? [y/N]'
        }], function (err, j) {
          if (err) {
            throw err;
          }


          if (j.okay && (j.okay[0] == 'y' || j.okay[0] == 'Y') ) {

            cp(sites[type].path, './'+sitename, function (err) {
              if (err) {
                throw err;
              }

              winston.info('* Created'+('`./'+sitename+'`').yellow+'.');
            });
          }


        });
      });
    });


  });
}
