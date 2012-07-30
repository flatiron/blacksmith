var smith = require("../blacksmith"),
    fs = require("fs"),
    Hash = require("hashish");

// Helper to sort by an "order" list
var byOrder = function (subtoc, order) {

    // We end up copying items from the "oldtoc" to the "newtoc" later.
    //
    // This algorithm checks for the keys on the root of this subtoc
    // often, so we extract those out for easier matching later.
    var oldToc = subtoc,
        newToc = Array(subtoc.length);
        elements = oldToc.map(function (t) {
          return Object.keys(t)[0];
        });

    // Place the elements that are explicitly ordered.
    Object.keys(order).forEach(function (name) {

      var setOrder = order[name],
          currentOrder = elements.indexOf(name);

      if (currentOrder !== -1) {
        // Copy the row into the new Table of Contents.
        newToc[setOrder] = subtoc[currentOrder];

        // oldToc holds toc elements not in newToc, but we pull newTocs from
        // subtoc so that the indices match.

        // Find the moved element in the oldToc and then remove it.
        // Later, we use oldToc to fill in unspecified indices.
        var i = oldToc.map(function (t) {
          return Object.keys(t)[0];
        }).indexOf(name);

        oldToc = oldToc.slice(0, i).concat(oldToc.slice(i+1));
      }
    });

    // Use elements not explicitly ordered to fill out the rest of the
    // newToc.
    for (var i = 0; i < newToc.length; i++) {
      newToc[i] = newToc[i] || oldToc.pop();
    }

    return newToc;

}

// This sorter shuffles the subtoc layer based on "order" properties specified
// by an "order" property.
exports.bySpecified = function (subtoc, filename) {
  var order;

  // If the page.json exists, it may have an "order" property, which matches
  // children directory names with list indices.
  try {
    order = JSON.parse(
      fs.readFileSync(filename+"/page.json").toString()
    ).order;
  } catch (e) {
    if (e.code !== "EBADF") {
      smith.log.warn("Having trouble reading "+filename+"/page.json");
      smith.log.warn(JSON.stringify(e.stack, true, 2));
    }

    return subtoc;
  }

  // "Order" supports negative indices, as in Python. This map converts
  // those negative indices into proper positive ones.
  order = Hash(order).map(function (n) {
    if (n < 0) {
      return Object.keys(subtoc).length + n;
    } else {
      return n;
    }
  }).items;

  return byOrder(subtoc, order);

}

// This sorts by the specified dates of the children.
exports.byDate = function (subtoc, filename) {

  // TODO: Rewrite to use loaded smith.content.content instead of
  // doing more reads.
  var order = {};

  fs.readdirSync(filename).filter(function (fn) {
    return fs.statSync(filename + "/" + fn).isDirectory();
  }).filter(function (fn) {
    return fs.existsSync(filename + "/" + fn + "/page.json");
  }).map(function (fn) {
    var res;
    try {
      res = [fn, new Date(JSON.parse(
        fs.readFileSync(filename + "/" + fn + "/page.json").toString()
      ).date)];
    } catch (e) {
      //smith.log.silly("Having trouble reading "+filename + "/" + fn+"/page.json");
      //smith.log.silly(JSON.stringify(e.stack, true, 2));

      res = [fn, new Date("January 1, 1970")];
    }

    if (res[1].toDateString() == "Invalid Date") {
      //smith.log.silly(filename + "/" + fn + "/page.json contains an invalid datestring!");
      res[1] = new Date("January 1, 1970");
    }

    return res;
  }).sort(function (a, b) {
    // Sort by date.
    return b[1] - a[1];
  }).forEach(function (t, i) {
    // Build the type of object byOrder expects
    order[t[0]] = i;
  });

  return byOrder(subtoc, order);
}
