Suppose you want to list all the files in the current directory, you can use the builtin `fs.readdir` method <link to fs module>. This will get you a list of all the files and directories:

    fs = require('fs');

    fs.readdir(process.cwd(), function (err, files) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(files);
    });


Unfortunately, if you want to do a recursive list of files, then things get much more complicated very quickly. To maintain complexity, it is recommended to use libraries. [Node-findit](https://github.com/substack/node-findit), by SubStack, is a helper module to make searching for files easier.  It has interfaces to let you work with callbacks, events, or just plain old synchronously (generally, keep away from using synchronously interfaces). Here we will create use the event interface to print a list of the directories and files.

To install `node-findit`, in the main folder of your project run:

    npm install findit

In the same folder, create a file called `example.js` with this inside of it and then run it with `node example.js`:

    //This sets up the file finder
    var finder = require('findit').find(__dirname);

    //This listens for directories found
    finder.on('directory', function (dir) {
      console.log('Directory: ' + dir + '/');
    });

    //This listens for files found
    finder.on('file', function (file) {
      console.log('File: ' + file);
    });
