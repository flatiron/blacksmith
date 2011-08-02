var dnode = require('dnode');

dnode.connect(8080, function (remote) {
  remote.getGuide('what-are-callbacks', function (err, guide) {
    if (err) {
      return console.log(err);
    }
    console.log(guide);
  });

  remote.getGuides('core', function (err, list) {
    if (err) {
      return console.log(err);
    }
    console.log(list);
  });

  remote.getTags(function (err, tags) {
    if (err) {
      return console.log(err);
    }
    console.log(tags);
  });
});
