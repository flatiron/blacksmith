This task is very simple because writing to a file is built into the Node.js api. We can use the handy api call `writeFile` inside the `fs` module which makes the whole process very streamlined. 

    fs = require('fs');
    fs.writeFile(filename, data, [encoding], [callback])

`file = (string)` filepath of the file to read

`data = (string or buffer)` the data you want to write to the file

`encoding = (optional string)` the encoding of the `data`. Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding provided, then 'utf8' is assumed.

`callback = (optional function (err) {})` If there is no error, `err === null`, otherwise `err` contains the error message.

So if we wanted to write "Hello World" to `helloworld.txt`:

    fs = require('fs');
    fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });

    [contents of helloworld.txt]:
    Hello World!

If we purposely want to cause an error, we can try to write to a file that we don't have permission to access:

    fs = require('fs')
    fs.writeFile('/etc/doesntexist', 'abc', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });

    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'EACCES, Permission denied \'/etc/doesntexist\'',
      errno: 13,
      code: 'EACCES',
      path: '/etc/doesntexist' }
