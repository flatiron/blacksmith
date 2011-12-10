var smith = require('../blacksmith'),
    path = require('path'),
    fs2 = require('../fs2');

var files = exports;

files.weld = function(dom, data) {

  var files = {},
      content = smith.content.content;

  Object.keys(content).forEach(function (i) {
    if (content[i].files) {
      Object.keys(content[i].files).forEach(function (j) {
        var path = i+"/"+j;

        files[path] = content[i].files[j];
      
      });
    }
  });

  smith.content.files = files;

  return;
};

files.generate = function(output, files) {

  Object.keys(files).forEach(function (f) {
    var newPath = f.replace(path.resolve(smith.src), path.resolve(smith.dst));

    smith.log.info("Writing "+newPath);

    fs2.writeFile(newPath, files[f], function(){});

  });

  return;
};
