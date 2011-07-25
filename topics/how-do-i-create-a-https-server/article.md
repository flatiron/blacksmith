
To create a HTTPS server, you need to get an SSL certificate and then use the `https` module. Generally, you want to use a CA-signed certicate in a production environment, but for testing purpose, a self-signed certicate is enough.

To generate a self-signed certificate:

    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem

This should leave you with two files, `cert.pem` (the certificate) and `key.pem` (the private key). This is all you need for a SSL connection. So now you set up a quick hello world example (the main addition from http <link to article> is the options parameter):

    var https = require('https');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    };

    var a = https.createServer(options, function (req, res) {
      res.writeHead(200);
      res.end("hello world\n");
    }).listen(8000);

Now you should be able to get the file with curl:

    curl -k https://localhost:8000

or in your browser, by going to `https://localhost:8000`. 
