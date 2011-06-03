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
