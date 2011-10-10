
    var static = require('node-static');
    var http = require('http');

    var file = new(static.Server)();

    http.createServer(function (req, res) {
      file.serve(req, res);
    }).listen(8080);

