# How do I make an http request?

Another extremely common programming task is making an HTTP request to a web server.  Node.js provides an extremely simple API for this functionality in the form of `http.request`. 

As an example, we are going to preform a GET request to <www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new> (which returns a random integer between 1 and 10) and print the result to the console.


    // We need the http module for `http.request`
    var http = require('http');

    // The First parameter of http.request is an options object.
    var options = {
      host: 'www.random.org', // The host to make your request to.
      port: 80, // The port to send your request to.
      path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new', // The specific URL for your request.
      method: 'GET' // The HTTP verb to use with your request.

      // If you wanted to send additional headers:
      // headers: { "custom": "headers.." }
    };

    //This callback is called with the reponse object
    callback = function(response) {

      // reponse has all sorts of useful attributes such as statusCode and headers
      //  console.log(response);

      //Make sure that the "body" of the reponse is in utf8 format
      response.setEncoding('utf8');

      //This event listener is fired each time a 'chunk' of the body arrives
      response.on('data', function (chunk) {
        console.log(chunk);
      });

      // If you want a callback when all the body is done arriving,
      // you can listen for the `end` event:
      //response.on('end', function (chunk) {
      //  console.log("no more data");
      //});

    }

    //Send the request off, the `.end()` call actually sends off the request
    http.request(options, callback).end();

    //If you were sending data to the server, such as with a POST request:
    //var req = http.request(options, callback);
    //    req.write(data);
    //    req.end();

As you can see, sending off a request is pretty trivial in Node.js - all it takes is the right options and a few function calls.


