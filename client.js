var dnode = require('dnode');

dnode.connect(8080, function (remote) {
  remote.getGuide('what-are-callbacks', function () {
    console.log(arguments);
  });

  remote.getGuides('core', function () {
    console.log(arguments);
  });

  remote.getTags(function () {
    console.log(arguments);
  });
});
