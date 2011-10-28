var docs     = require('../docs'),
    weld     = require('weld').weld,
    markdown = require('github-flavored-markdown'),
    findit   = require('findit'),
    fs       = require('fs'),
    fs2      = require('../fs2'),
    path     = require('path'),
    helpers  = require('../helpers'),
    buildToc = require('../toc').buildToc;

var errors = exports;


errors.weld = function(dom, errs) {

  var $ = docs.window.$;

  Object.keys(errs).forEach(function(err) {

    //start with our theme
    dom.innerHTML = docs.content.theme['./error.html'].toString();

    // Here, we build up the table of contents.
    var toc = helpers.buildToc(docs.src);

    //set up the data
    var data = {
      status: errs[err].status,
      message: errs[err].message,
      toc: toc
    };

    //weld it!
    weld(dom, data, {
      map: function(parent, element, key, val) {

        if ($(element).attr("id") === "toc") {
          element.innerHTML = val;
          return false;
        }

        return true;

      }
    });

    //Attach the results to errs
    errs[err].content = dom.innerHTML;
  });
  
  return dom;

};


errors.generate = function(output, errs) {

  //
  // Generate the error view
  //
  Object.keys(errs).forEach(function(err){
    var newPath =  path.normalize("./public/" + errs[err].status + '.html');
    fs2.writeFile(newPath, errs[err].content, function(){});
  });

  return errs;
};

errors.load = function() {
  // TODO: Think about what I *really* want to return.
  return { 404: { status: 404,
           message: "File not found" }};
};
