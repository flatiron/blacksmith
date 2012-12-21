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
// ####   @options.content    {string} **Optional** Main content to render in this partial
// ####   @options.html       {string} HTML to render `options.content` into.
// ####   @options.metadata   {Object} Metadata used to render the partial.
// ####   @options.references {Object} Metadata references for lookup.
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
  options.metadata = metadata.render(options.metadata, options.references);
  options.metadata.content = options.content;

  var map = exports.map(options.metadata),
      rendered;

  if (options.remove) {
    map = exports.remove(options.metadata, options.remove, map);
  }

  //
  // Perform rendering passes
  //
  return plates.bind(
    options.html,
    options.metadata,
    map
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
    map["class"]('content').use('content').as('value');
  }

  if (Array.isArray(metadata) && metadata[0]
    && typeof metadata[0] === 'object') {
    exports.map(metadata[0], map);
  }
  else {
    //
    // Ensure that a proper `plates` map is built for inserting data
    // into partials by iterating over keys in `metadata`.
    //
    Object.keys(metadata).forEach(function (key) {
      var keyType = typeof metadata[key],
          keyExp;

      if (key === 'source') {
        keyExp = new RegExp('/' + key + '$');
        map.where('href').has(keyExp).replace(keyExp, metadata[key]);
      }
      else if (keyType == 'string') {
        if (/^(http[s]?\:\/\/|\/)/.test(metadata[key])) {
          //
          // TODO: Infer if `href` is always the right attribute choice
          // based on parsed HTML fragment.
          //
          map.where('href').is(key).use(key).as('href');
        }
        else {
          // map.where('href')
          //    .has(new RegExp(key + '$'))
          //    .replace(new RegExp(key + '$'), metadata[key]);
          //console.log('map.class(%s).use(%s);', key, key);
          map["class"](key).use(key);
        }
      }
      else if (keyType == 'boolean' || keyType == 'number' || keyType == 'undefined'
        || keyType == 'object') {

        //console.log('map.class(%s).use(%s);', key, key)
        map["class"](key).use(key);

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
  }

  return map;
};

//
// Ensure that any elements are removed which have missing
// known metadata values.
//
// {
//   'page-details': ['date', 'files']
// }
//
exports.remove = function (metadata, remove, map) {
  Object.keys(remove).forEach(function (key) {
    if (Array.isArray(remove[key])) {
      //
      // If removeable
      //
      remove[key].forEach(function (req) {
        if (!metadata[key][req]) {
          //console.log("map.class('if-' + %s).remove();", req);
          map["class"]('if-' + req).remove();
        }
      });
    }
    else if (remove[key] && typeof remove[key] === 'object') {
      exports.remove(metadata[key], remove[key], map);
    }
  });

  return map;
};