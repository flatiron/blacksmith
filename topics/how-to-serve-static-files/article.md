A basic necessity for most [link]http server is to be able to serve static files. Thankfully it is not that hard to do in node.js. First you [link]read the file and then serve the file. Here is a script that will serve the files in the current directory:

    var fs = require('fs');
    var http = require('http');

    http.createServer(function (req, res) {
      fs.readFile(__dirname + req.url, function (err,data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    }).listen(8080);

What this does is that is takes the path requested and it serves that path from the local directory. This works fine as a quick solution; however, there are a few problems with this approach. First, this code does not correctly handle mime types. Also, from a proper static file server, it really should take advantage of client side caching and send a "Not Modified" response if nothing has changed. Also, there are security bugs where you can break out of the current directory. (for example, `GET /../../../`). Finally, there are a handful of other optimizations such as using file streams and caches which can make the entire thing much faster.

Each of these can be addressed invidually fairly easily. You can send the proper mime type header. You can figure how to utilize the client caches. You can take advantage of `path.normalize` to make sure that requests don't break out of the current directory. But in general, you do not want to try and spend the time to write all that code when you can just use someone else's library. 

There is a good static file server called [node-static](https://github.com/cloudhead/node-static) written by Alexis Sellier which you can leverage. Here is a script which functions similarly to the previous one:

    var static = require('node-static');
    var http = require('http');

    var file = new(static.Server)();

    http.createServer(function (req, res) {
      file.serve(req, res);
    }).listen(8080);

This is a fully functional file server that doesn't have any of the bugs previously mentioned. This is just the most basic set up, there are more things you can do if you look at [the api](https://github.com/cloudhead/node-static). Also since it is an opensource project, you can always modify it to your needs (and feel free to contribute it back).
