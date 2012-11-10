/*
 * partial.js: A single partial composed of metadata, and (optionally) content.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    plates = require('plates'),
    utile = require('flatiron').common,
    async = utile.async,
    inflect = utile.inflect,
    common = require('./common'),
    metadata = require('./metadata');

//
// ### function render (options, callback)
// #### @options {Object} Options to render a given partial
// ####   @options.html {string} HTML to render.
// ####   @options.metadata {Object} Metadata used to render the partial.
// 
// Renders a given partial with the specified HTML and metadata
//
exports.render = function (options) {
  if (!options || !options.html || !options.metadata) {
    throw new Error('Cannot render partial without html, metadata, or page');
  }
  
  //
  // Render the metadata. This will include looking up metadata references,
  // and resolving blacksmith links.
  //
  options.metadata = metadata.render(options.metadata, options);
  options.metadata.content = options.content
  
  //
  // Render the partial
  //
  return plates.bind(
    options.html, 
    options.metadata,
    exports.map(options.metadata)
  );    
};

exports.map = function (metadata, map) {
  if (!map) {
    //
    // Always look for class="content" first.
    //
    map = plates.Map();
    map.class('content').use('content').as('value');
  }

  Object.keys(metadata).forEach(function (key) {
    var keyType = typeof metadata[key];
    
    if (keyType == 'string') {
      if (/^(http[s]?\:\/\/|\/)/.test(metadata[key])) {
        //
        // TODO: Infer if `href` is always the right attribute choice
        // based on parsed HTML fragment.
        //
        map.where('href').is(key).use(key).as('href');
      }
      else {
        map.class(key).use(key)
      }
    }
    else if (keyType == 'boolean' || keyType == 'number' || keyType == 'undefined'
      || keyType == 'object') {
      
      map.class(key).use(key);
  
      if (Array.isArray(metadata[key]) && metadata[key][0] 
        && typeof metadata[key][0] === 'object') {
        //
        // TODO: This is a really bad way to infer based on arrays
        //
        exports.map(metadata[key][0], map);
      }
      else if (metadata[key] && keyType == 'object' && !Array.isArray(metadata[key])) {
        exports.map(metadata[key], map);
      }
    }
  });
  
  return map;
};