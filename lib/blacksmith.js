/*
 * Blacksmith - Top-level include for the blacksmith project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var smith    = exports,
    winston  = smith.winston = require('winston'),
    traverse = require('traverse'),
    path     = require('path'),
    jsdom    = require('jsdom'),
    markdown = require('github-flavored-markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    nconf    = require('nconf'),
    prompt   = require('prompt'),
    findit   = require('findit');

smith.helpers = require('./helpers');
smith.sites = require('blacksmith-sites');


smith.log = winston;

// Use nconf to manage global configuration. Attached to smith object for later
// use.
nconf.add("global", { type: "file", file: "./config.json"});
smith.config = nconf;

// smith.renderers is a list of key/value pairs so we can depend on method
// execution being in-order. This is important, for example, in the case of
// authors, since their loaded data is also used for extending metadata for the
// articles.
smith.renderers = [
  { authors     : require('./renderers/authors')},
  { toc         : require('./renderers/toc')},
  { theme       : require('./renderers/theme')},
  { content     : require('./renderers/content')},
  { all         : require('./renderers/all')},
  { files       : require('./renderers/files')},
  { rss         : require('./renderers/rss')},
  { errors      : require('./renderers/errors')}
];

// smith.content will store static content during generation.
// Examples include articles, themes and authors.
smith.content = {};

smith.generate = exports.generate = function (src, dst, cb) {

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

     // Iterate through every generator, each of which may output a set of
     // files and/or directories.
     // This block is wrapped in a try / catch since JSDOM is squashing some
     // errors.
     try {
       smith.renderers.forEach( function (renderer) {
         // Grabs the name given to the generator.
         var name = Object.keys(renderer)[0];

         winston.debug("Loading \""+name+"\"");

         // Load assets
         smith.content[name] = renderer[name].load(true);


         winston.debug("Rendering \""+name+"\"");
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
           + "\n"
           + div.innerHTML, smith.content[name]
         );
       });
       cb(0);
     } catch (err) {
       String(err.stack).split("\n").forEach(winston.error);
       cb(1);
     }
   });

};
