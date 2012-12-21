/*
 * metadata.js: Helpers for rendering metadata objects into strings.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    utile = require('flatiron').common,
    async = utile.async,
    inflect = utile.inflect,
    common = require('./common');

//
// ### function render (metadata)
// #### @metadata {Object} Metadata to render.
//
// Renders the specified `metadata` for use with `plates`.
//
exports.render = function (metadata, references) {
  if (Array.isArray(metadata)) {
    return metadata;
  }

  metadata = utile.clone(metadata);

  Object.keys(metadata).forEach(function (key) {
    var plural  = inflect.pluralize(key),
        keyType = typeof metadata[key],
        refname;

    if (key === 'page-details') {
      //
      // Here we special case the key `page-details` because it contains
      // **only blacksmith specific references.**
      //
      return;
    }
    else if (keyType == 'string') {
      if (references) {
        //
        // If there are references, then attempt to lookup the value
        // of the key within references at the plural of the key. e.g.:
        //
        // { author: 'Charlie Robbins' } ==> { authors: 'charlie-robbins' }
        // { author: 'indexzero' }       ==> { authors: 'indexzero' }
        //
        refname = metadata[key].toLowerCase().replace(' ', '-');

        if (references[plural] && references[plural][refname]) {
          metadata[key] = references[plural][refname];
        }
      }
    }
    else if (Array.isArray(metadata[key]) || keyType == 'boolean'
      || keyType == 'number' || keyType == 'undefined') {
      //
      // Ignore Arrays, booleans, string, numbers, null, and undefined
      // since plates will handle them gracefully.
      //
      return;
    }
    else if (metadata[key] instanceof Date) {
      //
      // Convert dates to strings.
      // TODO: This should be configurable.
      //
      metadata[key] = metadata[key].toLocaleDateString();
    }
    else {
      //
      // Render nested metadata.
      //
      metadata[key] = exports.render(metadata[key]);
    }
  });

  //
  // Copy default `blacksmith` references into `page-details`.
  //
  if (references) {
    if (metadata.author) {
      metadata['page-details'].author = metadata.author;
      delete metadata.author;
    }
  }

  return metadata;
};