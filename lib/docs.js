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
    markdown = require('markdown'),
    mkdirp   = require('mkdirp'),
    fs       = require('fs'),
    findit   = require('findit');

docs = exports;

docs.helpers = require('./helpers');

docs.generators = {
  theme   : require('./generators/theme'),
  article : require('./generators/article'),
  home    : require('./generators/home'),
  toc     : require('./generators/toc')
};

//
// Remark: docs.content will store all static content during generation,
// such as: articles, themes, authors, etc...
//
docs.content = {};

docs.generate = exports.generate = function () {
  
  jsdom.env( "<html><body></body></html>", [], function (err, window) {
     if (err) {
       console.log("jsdom error: "+err);
       throw err;
     }

     //
     // Remark: To make generation easy, we pass an empty DOM
     // element to each generator. This is used for Weld based 
     // DOM templating.
     //
     //
     // We could pass the window object around, or create
     // multiple windows, or even just create multiple dom elements.
     // I don't think we should create more elements or doms then needed.
     // Creating just one dom node and passing it around seems more efficient here
     //
     //
     var div = window.document.createElement('div');

     //
     //  Iterate through every generator, 
     //  each generator may output a set of files and directories
     //
     console.log('ready to generate docs...');

     Object.keys(docs.generators).forEach(function(generator){
       //
       // Load any required assets
       //
       docs.content[generator] = docs.generators[generator].load();

       //
       // Perform the weld on the div
       //
       docs.generators[generator].weld(div);

       //
       // Generate the static content
       //
       docs.generators[generator].generate(docs.content[generator]);
     });

   });

};

