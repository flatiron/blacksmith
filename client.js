var dnode = require('dnode');

dnode.connect(8080, function (remote) {
  remote.getGuide('what-are-callbacks', function (err, guide) {
    console.log(guide);
  });

  remote.getGuides('core', function (err, list) {
    console.log(list);
  });

  remote.getTags(function (err, tags) {
    console.log(tags);
  });
});
