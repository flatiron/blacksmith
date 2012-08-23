/*
 * Blacksmith - Top-level include for the blacksmith project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = exports,
    winston  = require('winston'),
    path     = require('path'),
    jsdom    = require('jsdom'),
    fs       = require('fs'),
    nconf    = require('nconf'),
    prompt   = require('prompt');

smith.helpers = require('./helpers');
smith.sites = require('blacksmith-sites');

// TODO: Make configurable.
smith.log = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      colorize: true
    })
  ]
});

// Use nconf to manage global configuration. Attached to smith object for later
// use.
smith.config = nconf;

// Try to load configuration if the file exists.
if (path.existsSync('./config.json')) {
  smith.config.add("global", { type: "file", file: "./config.json"});

  var pathname = require('url').parse('http://'+(smith.config.get('url') || "")).pathname;
  if (pathname == '/') {
    pathname = '';
  }
  smith.config.set('path', pathname);
}

// smith.loaders is a list of key/value pairs so we can depend on method
// execution being in-order.
smith.loaders = [
  'authors',
  'theme',
  'content',
  'toc',
  'rss',
  'errors'
].map(function (k) {
  var t = {};
  t[k] = require('./loaders/' + k);
  return t;
});

// smith.renderers is a list of key/value pairs so we can depend on method
// execution being in-order.
smith.renderers = [
  'theme',
  'content',
  'archive',
  'files',
  'rss',
  'errors'
].map(function (k) {
  var t = {};
  t[k] = require('./renderers/' + k);
  return t;
});

// smith.content will store static content during generation.
// Examples include articles, themes and authors.
smith.content = {};

smith.generate = exports.generate = function (src, dst, cb) {

  smith.content = {};

  // Attach source and destination paths to the smith. This will eventually
  // enable multi-site generation.
  smith.src = path.resolve(src);
  smith.dst = path.resolve(dst);
  smith.log.silly('Source directory: '+smith.src);
  smith.log.silly('Destination directory: '+smith.dst);

  jsdom.env( "<html><body></body></html>", ['./jquery.js'], function (err, window) {
    if (err) {
      smith.log.error("Error while creating jsdom: "+err.message);
      throw err;
    }

    // This is so we can call jquery later (smith.window.$)
    smith.window = window;

    // We pass an empty DOM element to each generator. This is used for
    // Weld-based templating.
    //
    // We could pass the window object around, or create multiple windows, or
    // even just create multiple jsdoms. Using a div, however, is simple and
    // relatively performant.
    var div = window.document.createElement('div');

    smith.loaders.forEach( function (loader) {
      var name = Object.keys(loader)[0];

      smith.log.info('Loading "' + name + '"');

      try {
        // Load assets
        // TODO: Rename "content" to something more appropriate
        smith.content[name] = loader[name].load(true);

      } catch (err) {
        smith.log.error( 'Problem loading "' + name + '"' );
        String(err.stack).split("\n").forEach(smith.log.error);
        cb(1);
      }

    });

    // Iterate through every generator, each of which may output a set of
    // files and/or directories.
    // This block is wrapped in a try / catch since JSDOM is squashing some
    // errors.
    smith.renderers.forEach( function (renderer) {
      // Grabs the name given to the generator.
      var name = Object.keys(renderer)[0];

      smith.log.info('Rendering "'+name+'"');

      try {
        // Perform a weld on the div.
        renderer[name].weld(div, smith.content[name]);

        // Write the content to disk.
        //
        // Note: jsdom strips doctypes. If we were using full doms we could
        // access the doctype for each individual page, but 
        // because we're using the div to contain our document this
        // information never gets added to jsdom.
        //
        // The doctype for jsdom gets set explicitly during content loading.
        renderer[name].generate(
          smith.window.document.doctype
          + '\n'
          + div.innerHTML, smith.content[name]
        );
      } catch (err) {
        smith.log.error( 'Problem rendering "' + name + '"' );
        String(err.stack).split("\n").forEach(smith.log.error);
        cb(1);
      }
    });

    cb(0);

  });

};
