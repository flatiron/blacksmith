/*
 * Blacksmith - Top-level include for the blacksmith project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = exports,
    winston  = smith.winston = require('winston'),
    path     = require('path'),
    jsdom    = require('jsdom'),
    fs       = require('fs'),
    nconf    = require('nconf'),
    prompt   = require('prompt');

smith.helpers = require('./helpers');
smith.sites = require('blacksmith-sites');


smith.log = winston;

// Use nconf to manage global configuration. Attached to smith object for later
// use.
smith.config = nconf;

// Try to load configuration if the file exists.
if (path.existsSync('./config.json')) {
  smith.config.add("global", { type: "file", file: "./config.json"});
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

  jsdom.env( "<html><body></body></html>", ['./jquery.js'], function (err, window) {
    if (err) {
      winston.error("jsdom error: "+err);
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

      winston.debug('Loading "' + name + '"');

      try {
        // Load assets
        // TODO: Rename "content" to something more appropriate
        smith.content[name] = loader[name].load(true);

      } catch (err) {
        winston.error( 'Problem loading "' + name + '"' );
        String(err.stack).split("\n").forEach(winston.error);
        return cb(1);
      }

    });

    // Iterate through every generator, each of which may output a set of
    // files and/or directories.
    // This block is wrapped in a try / catch since JSDOM is squashing some
    // errors.
    smith.renderers.forEach( function (renderer) {
      // Grabs the name given to the generator.
      var name = Object.keys(renderer)[0];

      winston.debug('Rendering "'+name+'"');

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
        winston.error( 'Problem rendering "' + name + '"' );
        String(err.stack).split("\n").forEach(winston.error);
        return cb(1);
      }
    });

    cb(0);

  });

};
