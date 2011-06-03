This task is very simple because reading a file is built into the node.js api. We can use the handy api call `readFile` inside the `fs` module which is very easy to use thankfully. 

    fs = require('fs');
    fs.readFile(file, [encoding], [callback]);

    file = (string) filepath of the file to read

`encoding = (optional string)` the type of encoding to read the file. Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding provided, the raw buffer is returned.

`callback = (optional function (err, data) {})` If there is no error, `err === null` and `data` will contain the file contents, otherwise `err` contains the error message.

So if we wanted to read `/etc/hosts` and print it to stdout:

    fs = require('fs')
    fs.readFile('/etc/hosts', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });


    [prints: contents of '/etc/hosts']

An example of what happens when you read an invalid file

    fs = require('fs')
    fs.readFile('/doesnt/exist', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });

    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'ENOENT, No such file or directory \'/doesnt/exist\'',
      errno: 2,
      code: 'ENOENT',
      path: '/doesnt/exist' }
