    var http = require('http');
    var profiler = require('v8-profiler');

    var x = 0;
    http.createServer(function (req, res) {
      x += 1;
      profiler.startProfiling('request '+x);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World ' + x);
      profiler.stopProfiling('request '+x);
    }).listen(8124);
    profiler.takeSnapshot('Post-Server Snapshot');
    console.log('Server running at http://127.0.0.1:8124/');

