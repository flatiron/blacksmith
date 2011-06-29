Reading the POST data from a form can be a little counter-intuitive in node.js. What you have to do is listen for incoming data and once its all finished, you can process the form data. Here is a quick script that shows you how to do exactly that:

    var http = require('http');
    var postHTML = 
      '<html><head><title>Post Example</title></head>' +
      '<body>' +
      '<form method="post">' +
      'Input 1: <input name="input1"><br>' +
      'Input 2: <input name="input2"><br>' +
      '<input type="submit">' +
      '</form>' +
      '</body></html>';

    http.createServer(function (req, res) {
      var body = "";
      req.on('data', function (chunk) {
        body += chunk;
      });
      req.on('end', function () {
        console.log('POSTed: ' + body);
        res.writeHead(200);
        res.end(postHTML);
      });
    }).listen(8080);

The variable `postHTML` is a static string containing the HTML for two input boxes and a submit box so you can POST example data. The static string was used to keep the example simple, I wouldn't recommend embedding a HTML like this, go here for example on [link]how to server static files. Then we [link]create a server. The important part to catching the POST data is that the `req` object is also an [link]Event Emitter. So req will emit the `data` event whenever there is incoming data. When there is no more incoming data, the `end` event is emitted. So here we listen for `data` event and just store the incoming data to a string. Once all the data is recieved, we console out the data and send the response. 

Something important to notice is that the `on` methods are being called immediately after getting the request object. If you don't immediately set them, then there is a possibility of missing those events. For example, if the `on` method was called in a callback, then the `data` and `end` events with no listeners might be called in the meantime. [link to async codeflow?]

You can save this script to `server.js` and run it with `node server.js`. Once you run it you will notice that occassionally you will see lines with no data, e.g. `POSTed: `. This happens because regular `GET` requests go through the same codepath. That's important to note when you are coding.

