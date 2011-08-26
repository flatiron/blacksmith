fs = require('fs');
fs.writeFile('helloworld.txt', 'Hello World', function (err) {
  if (err) return console.log(err);
  console.log('Hello World > helloworld.txt');
});

fs = require('fs')
fs.writeFile('/etc/doesntexist', 'abc', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
