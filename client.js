var dnode = require('dnode');

dnode.connect(5050, function (remote) {
  remote.getGuide('what-are-callbacks', function () {
    console.log(arguments);
  });

  remote.getGuides('awe', function () {
    console.log(arguments);
  });

  remote.getTags(function () {
    console.log(arguments);
  });
});
