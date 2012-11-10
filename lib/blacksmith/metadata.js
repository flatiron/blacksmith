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
    common = require('./common');

//
// ### function render (metadata) 
// #### @metadata {Object} Metadata to render.
//
// Renders the specified `metadata` for use with `plates`. 
//
// TODO: Render metadata references (e.g. authors)
//
exports.render = function (metadata) {
  var metadata = utile.clone(metadata);
  
  Object.keys(metadata).forEach(function (key) {
    var keyType = typeof metadata[key];
    
    if (key === 'page-details') {
      //
      // Here we special case the key `page-details` because it contains
      // **only blacksmith specific references.**
      //
      return;
    }
    else if (Array.isArray(metadata[key]) || keyType == 'boolean' 
      || keyType == 'string' || keyType == 'number'
      || keyType == 'undefined') {
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
  
  return metadata;
};