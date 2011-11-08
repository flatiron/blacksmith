var HTTPServer = require('http-server').HTTPServer;

var httpServer = new HTTPServer({
    root: './public/',
    port: process.env.PORT || process.env.C9_PORT || 80
});

httpServer.start();

process.on('SIGINT', function() {
  httpServer.log('http-server stopped.'.red);
  return process.exit();
});
