fs = require('fs');

fs.readFile('/etc/hosts', 'utf8', function (err,data) {
  if (err) {
    return console.log(err, "1\n");
  }
  console.log(data, "1\n");
});

fs.readFile('/etc/hosts', function (err,data) {
  if (err) {
    return console.log(err, "2\n");
  }
  console.log(data, "2\n");
});

fs.readFile('/doesnt/exist', 'utf-8', function (err,data) {
  if (err) {
    return console.log(err, "\n");
  }
  console.log(data, "\n");
});
