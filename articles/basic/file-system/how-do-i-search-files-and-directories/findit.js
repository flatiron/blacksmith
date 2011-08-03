var finder = require('findit').find(__dirname);

finder.on('directory', function (dir) {
  console.log('Directory: ' + dir + '/');
});

finder.on('file', function (file) {
  console.log('File: ' + file);
});
