    var http = require('http');

    var options = {
      host: '127.0.0.1',
      path: '/',
      port: '1337',
      method: 'POST'
    };

    callback = function(response) {
      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        console.log(str);
      });
    }

    var req = http.request(options, callback);
    req.write("HELLO WORLD");
    req.end();
