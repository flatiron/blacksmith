    var http = require('http');
    var postHTML = 
      '<html><head><title>Post Example</title></head>' +
      '<body>' +
      '<form method="post">' +
      'Input 1: <input name="input1"><br>' +
      'Input 2: <input name="input2"><br>' +
      '<input type="submit">' +
      '</form>' +
      '</body></html>';

    http.createServer(function (req, res) {
      var body = "";
      req.on('data', function (chunk) {
        body += chunk;
      });
      req.on('end', function () {
        console.log('POSTed: ' + body);
        res.writeHead(200);
        res.end(postHTML);
      });
    }).listen(8080);
