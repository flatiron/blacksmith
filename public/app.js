/**
 * Module dependencies.
 */
var express = require('express');
var app = express.createServer();
var socketIO = require('socket.io');

var mongoose = require('mongoose');
var db = app.db = mongoose.connect('mongodb://localhost/TweachIT');

module.exports = app;

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.register(".html", require("jqtpl").express);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use('main', require('./app/main.js'));
    app.use('messages', require('./app/messages.js'));
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


// Run server
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);

// Open Socket 
var socket = socketIO.listen(app); 
socket.on('connection', function(client) { 
  // client.on('message', function(){ … })
  // client.on('disconnect', function(){ … })
});