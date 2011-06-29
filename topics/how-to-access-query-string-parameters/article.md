In node.js, accessing the query string at the end of the URL is built into the standard libraries. The built-in `url.parse` takes care of most of the heavy lifting for us. So here is an example script using this handy function and an explanation on how it works:

    var fs = require('fs');
    var http = require('http');
    var url = require('url') ;

    http.createServer(function (req, res) {
      var queryObject = url.parse(req.url,true).query;
      console.log(queryObject);

      res.writeHead(200);
      res.end('Feel free to add query parameters to the end of the url');
    }).listen(8080);

The key part of this whole script is this line `var queryObject = url.parse(req.url,true).query;`. Working from the inside-out, first off, `req.url` will look like `/app.js?foo=bad&baz=foo`. This is the part that is in the URL bar of the browser. Next, it gets passed to `url.parse` which parses out the various elements of the URL (NOTE: the second paramater is a boolean stating whether the method should parse the query string, so we set it to true). And finally, since we are trying to get the query object, we just get the `.query` property. 


