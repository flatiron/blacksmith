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
    
exports.render = function (metadata, options) {
  var metadata = utile.clone(metadata);
  
  //
  // TODO: Render metadata references (e.g. authors)
  //
  Object.keys(metadata).forEach(function (key) {
    var keyType = typeof metadata[key];
    
    if (key === 'page-details') {
      //
      // Here we special case the key `page-details` because it contains
      // **only blacksmith specific references.**
      //
      metadata[key].date = metadata[key].date.toLocaleDateString();
      
      //
      // Update page files to include fully qualified hrefs
      //
      Object.keys(metadata[key].files).forEach(function (ext) {
        metadata[key].files[ext] = metadata[key].files[ext].map(function (name) {
          return {
            filename: name,
            url: options.page.href + '/' + name
          };
        });
      });
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
      metadata[key] = exports.render(metadata[key], options);
    }
  });
  
  return metadata;
};