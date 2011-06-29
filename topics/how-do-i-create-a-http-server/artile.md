One of the simpliest code snippets to show how to write an http server in node has to be:

    var http = require('http');
    var RequestListener = function (req, res) {
      res.writeHead(200);
      res.end('Hello World');
    }

    var server = http.createServer(RequestListener);
    server.listen(8080);

If you put this into a file called `server.js`. You can run `node server.js` in that directory to get the server running. Then fire up a webbrowser and goto the url `localhost:8080`. You should see "Hello World" on the screen. 

//This explanation might be confusing?
There are a few things that this does. First, it creates a function called `RequestListener` that takes a request object and a response object as parameters. The request object contains things such as the requested URL, but in this example we ignore it and always return "Hello World". The response object is how we send the headers and contents of the response. Here we return a 200 response code (signaling a successful response) with the body "Hello World". Next, the `http.createServer` method creates a server that calls the RequestListener whenever a request comes in. The next line calls the `listen` method which causes the server to listen for requests on port 1337. That's all you need for a basic node http server.
