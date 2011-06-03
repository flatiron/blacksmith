How do I make an http request?

It is fairly simple to do with the api call `http.request`. As an example, we are going to preform a GET request to <www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new> (which returns a random integer between 1 and 10) and print it to the console.


    // We need the http module for `http.request`
    var http = require('http');

    // The First parameter of http.request is an options object, most of the parameters are self-explanatory
    var options = {
      host: 'www.random.org',
      port: 80,
      path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new',
      method: 'GET'

      // If you wanted to send additional headers:
      // headers: { "custom": "headers.." }
    };

    //This callback is called with the reponse object
    callback = function(response) {

      // reponse has all sorts of useful attributes such as statusCode and headers
      //  console.log(response);

      //Make sure that the "body" of the reponse is in utf8 format
      response.setEncoding('utf8');

      //This callback is called whenever another "chunk of the body arrives"
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

    //If you are sending data to the server, perhaps because its a POST request:
    //var req = http.request(options, callback);
    //    req.write(data);
    //    req.end();

As you can see it is not that difficult to send off a request. Hopefully you can see how to modify the example to do any http request that you would be doing!




I dont know how useful this is, so I just cut it out:

    var options = {
      host: <hostname>, // for example: www.google.com/
      port: <port>,     // for most www traffic, the part is 80
      path: <file>,     // the file you are requesting, for example: /humans.txt
      method: 'GET'     // the method type which is normally GET or POST
    };

    var request = http.request(options, function(response) {
      // response has several useful attributes such as response.statusCode and
      //   response.headers. To see them all uncomment the next line:
      // console.log(reponse);

      response.setEncoding('utf8'); // Set the encoding of the body to utf8

      response.on('data', function (chunk) { // A new packet has arrived
        console.log(chunk);                  // Do whatever you want with the data
      });
    });

    request.end(); //send off the request
