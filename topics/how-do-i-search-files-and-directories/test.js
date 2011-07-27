fs = require('fs');
path = require('path');

getList = function (directory, callback) {
  var errors = [];
  var done = 0;
  var total = 0;
  var files = [];

  finish = function(err, new_files) {
    if (err) {
      errors.push(err);
    } else {
      files = files.concat(new_files);
    }
    ++done
    if (done == total) {
      if (errors.length > 0 ) {
        callback(errors);
        return;
      }
      callback(null, files);
      return;
    }
  }

  fs.readdir(directory, function(err, files) {
    if (err) {
      callback(err);
      return;
    }

    total = files.length;
    if (total == 0) {
      callback(null, []);
    }

    for ( var i = 0; i < files.length; ++i ) {
      (function (file) {
        fs.stat(file, function (err, stats) {
          if (err) {
            finish(err);
          }

          if(stats.isDirectory()) {
            --done;
            finish(null, file);
            getList(file, finish);
            return;
          }

          finish(null, file);
        });
      })(path.join(directory, files[i]));
    }
  });
}

getList('./a', function(err, files) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(files);
});
