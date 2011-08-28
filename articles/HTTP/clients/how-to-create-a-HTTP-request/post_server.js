var http = require('http');
http.createServer(function (req, res) {
  var str = '';
  req.on('data', function (chunk) {
    str += chunk;
  });
  req.on('end', function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(str);
  });
}).listen(1337);
