The path module is made up of several helper functions to make your path manipulation easier.

The `normalize` function takes a path (in the form of a string) and strips it of duplicate slashes and normalizes directories like `.` and `..`. For example:

    > var path = require('path');
    > path.normalize('/a/.///b/d/../c/')
    '/a/b/c/'

A closely related function to `normalize` is the `join` function takes a variable number of arguments and joins them together and then normalizes the path.

    > var path = require('path');
    > path.join('/a/.', './//b/', 'd/../c/')
    '/a/b/c'

A possible use of `join` is to manipulate paths when serving urls:

    > var path = require('path');
    > var url = '/index.htm';
    > path.join(process.cwd(), 'static', url);
    '/home/nico/static/index.htm'

There are three functions which are used to extract the various parts of the url: `basename`, `extname`, and `dirname`. `basename` returns the last portion of the path passed in. `extname` returns the extension of the last portion. Generally for directories, `extname` just returns ''. Finally, `dirname`, returns everything that `basename` does not return.

    > var path = require('path')
    > var a = '/a/b/c.htm'
    > path.basename(a)
    'c.htm'
    > path.extname(a)
    '.htm'
    > path.dirname(a)
    '/a/b'

Note, that `basename` has an optional 2nd parameter that will strip out the extension if you pass the correct extension.

    > var path = require('path')
    > path.basename(a, path.extname(a))
    'c'

There is one final set of functions which check the existance of a path: `exists` and `existsSync` They both take the path of a file for the first parameter. `exists` takes a callback as the second parameter which returns the existance of the file. `existsSync` checks the existance synchronously and returns the existance. In idiomatic node.js code, you typically want to use the former, because the latter will block the execution of your code. <link to aysnc article>

        > var path = require('path')
        > path.exists('/etc', function(exists){console.log("Does the file exist?", exists)})
        > Does the file exist? true

        > path.existsSync('/etc')
        true
