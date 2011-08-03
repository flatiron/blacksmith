# How do I make an http request?

Another extremely common programming task is making an HTTP request to a web server.  Node.js provides an extremely simple API for this functionality in the form of `http.request`.

As an example, we are going to preform a GET request to <www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new> (which returns a random integer between 1 and 10) and print the result to the console.

    var http = require('http');

    //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
    var options = {
      host: 'www.random.org',
      path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
    };

    callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log(str);
      });
    }

    http.request(options, callback).end();


Making a POST request is just as easy. Unfortunately, there are no simple POST endpoints to use as an example. You can use this script to spawn up a server that listens for POST requests and echos back the request. //If we can just run it on the nodedocs server, that would make things much easier

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

The code for making a POST request is almost identical to making a GET request. Just a few simple modifications:

    var http = require('http');

    //The url we want is `127.0.0.1:1337/`
    var options = {
      host: '127.0.0.1',
      path: '/',
      //since we are listening on a custom port, we need to specify it by hand
      port: '1337',
      //This is what changes the request to a POST request
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
    //This is the data we are posting, it needs to be a string or a buffer
    req.write("hello world!");
    req.end();


Finally, if you need to make a request with custom headers, things are just about the same. First run this script /*if we can run this server side, it would be awesome*/:

    var http = require('http');
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(req.headers.custom);
    }).listen(1337);

Now we can make requests with custom headers and it will echo back the header `custom`.

    var http = require('http');

    var options = {
      host: '127.0.0.1',
      path: '/',
      port: '1337',
      //This is the only line that is new. `headers` is an object with the headers to request
      headers: {'custom': 'Custom Header Demo works'}
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
    req.end();
