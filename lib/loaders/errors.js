/*
 * errors.js: Methods for generating "error" pages (the 404 page in particular).
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var errors = exports;

errors.load = function() {

  // In this case, I simply return a hash of error pages to be generated, with
  // a simple message. There is only one expected error, a 404, and its contents
  // are static, so it's simply hard-coded here.
  return {
    404: {
      status: 404,
      message: "File not found"
    }
  };
};

