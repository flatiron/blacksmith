    var fs = require('fs');
    var http = require('http');
    var url = require('url') ;

    http.createServer(function (req, res) {
      var queryObject = url.parse(req.url,true).query;
      console.log(queryObject);

      res.writeHead(200);
      res.end('Feel free to add query parameters to the end of the url');
    }).listen(8080);

