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
    common = require('./common');

//
// ### function render (options, callback)
// #### @options {Object} Options to render a given partial
// ####   @options.html {string} HTML to render.
// ####   @options.metadata {Object} Metadata used to render the partial.
// #### @callback {function} Continuation to respond to when complete.
// 
// Renders a given partial with the specified HTML and metadata
//
exports.render = function (options, callback) {
  
};