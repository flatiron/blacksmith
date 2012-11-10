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
  options.metadata.content = options.content;
  
  //
  // Render the partial
  //
  return plates.bind(
    options.html, 
    options.metadata,
    exports.map(options.metadata)
  );    
};

//
// ### function map (metadata, map)
// #### @metadata {Object} Metadata to add to the plates `map`.
// #### @map {plates.Map} **Optional** Templating map constructed from `metdata`.
//
// Returns a `plates` Map to bind all `key:value` pairs in `metadata` to HTML.
// Intentionally, there are only a few customizations:
// 
// * _Map URL-like string keys to href="keyname":_ map.where('href').is(key).use(key).as('href');
// * _Insert "content" into class="content":_      map.class('content').use('content').as('value');
// * _Map string keys to class="keyname":_         map.class(key).use(key)
// * _Map everything else to class="keyname":_     map.class(key).use(key);
// * _Recursively map Array keys:_                 exports.map(metadata[key][0], map);
// * _Recursively map Object keys:_                exports.map(metadata[key], map);
//
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