fs = require('fs');

fs.readFile('example', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
});
//====================
var data = fs.readFileSync('example','utf8');
console.log(data);


