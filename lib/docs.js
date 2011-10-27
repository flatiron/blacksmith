/*
 * Docs - Top-level include for the docs project
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var docs   = {},
    traverse = require('traverse'),
    path     = require('path'),
    jsdom    = require('jsdom'),
    markdown = require('github-flavored-markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    nconf    = require('nconf'),
    findit   = require('findit');

docs = exports;

docs.helpers = require('./helpers');

// Use nconf to manage global configuration. Attached to docs object for later
// use.
nconf.add("global", { type: "file", file: __dirname + "/../conf/docs.json"});
docs.config = nconf;

// docs.generators is a list of key/value pairs so we can depend on method
// execution being in-order. This is important, for example, in the case of
// authors, since their loaded data is also used for extending metadata for the
// articles.
docs.generators = [
  { authors     : require('./generators/authors')},
  { theme       : require('./generators/theme')},
  { content     : require('./generators/content')},
  { rss         : require('./generators/rss')},
  { errors      : require('./generators/errors')}
];

// docs.content will store static content during generation.
// Examples include articles, themes and authors.
docs.content = {};

docs.generate = exports.generate = function (src, dst) {

  // Attach source and destination paths to the docs. This will eventually
  // enable multi-site generation.
  docs.src = path.resolve(src);
  docs.dst = path.resolve(dst);
  
  jsdom.env( "<html><body></body></html>", ['./jquery.js'], function (err, window) {
     if (err) {
       console.log("jsdom error: "+err);
       throw err;
     }

     // This is so we can call jquery later (docs.window.$)
     docs.window = window;

     // We pass an empty DOM element to each generator. This is used for
     // Weld-based templating.
     //
     // We could pass the window object around, or create multiple windows, or
     // even just create multiple jsdoms. Using a div, however, is simple and
     // relatively performant.
     var div = window.document.createElement('div');

     console.log('ready to generate docs...');

     // Iterate through every generator, each of which may output a set of
     // files and/or directories.
     // This block is wrapped in a try / catch since JSDOM is squashing some
     // errors.
     try {
       docs.generators.forEach( function (generator) {
         // Grabs the name given to the generator.
         var name = Object.keys(generator)[0];

         // Load assets
         docs.content[name] = generator[name].load(true);

         // Perform a weld on the div.
         generator[name].weld(div, docs.content[name]);

         // Write the content to disk.
         //
         // Note: jsdom strips doctypes. If we were using full doms we could
         // access the doctype for each individual page, but 
         // because we're using the div to contain our document this
         // information never gets added to jsdom.
         //
         // The doctype for jsdom gets set explicitly during content loading.
         generator[name].generate(
           docs.window.document.doctype
           + "\n"
           + div.innerHTML, docs.content[name]
         );
       });
     } catch (err) {
       console.log(err.stack);
     }
   });

};

