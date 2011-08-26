Streams are another basic construct in node.js that encourages asyncronous coding. Streams allow you to process the data as it is generated or retrieved. Streams can be readable, writeable or both. Readable streams emit the event `data` to listen for data and `end` which is emitted when there is no more data. Writeable streams can be written to with the `write()` function and closed with the `end()` function.

As a quick example of what streams are and their advantages, we can write a simple version of `cp` (the unix utility that copies files). We could do that by reading the whole file with standard filesystem calls and then writing it out to a file. Unfortunately, that requires that the whole file be read in before it can be written. In the case of 1-2 giga files, you could run into out of memory operations. The biggest advantage that streams give you over their non-stream versions are that you can start process the info before you have all the information. In this case, writing out the file doesn't get sped up, but if we were streaming over the internet or doing cpu processing on it then there could be measurable performance improvements.

So this script should be run like `node cp.js src.txt desc.txt`. This means `process.argv[2]` is `src.txt` and `process.argv[3]` is `desc.txt`. This sets up a readable stream from the source file and a writable stream to the destination file. Then whenever the readable stream gets data, it gets written to the writeable stream. Then finally it closes the writable stream when the readable stream is finished. NOTE: it would have been better to use [pipe](/how-to-use-stream-pipe) like `readStream.pipe(writeStream);`, however, to show how streams work, I opted not to.

    var fs = require('fs');
    console.log(process.argv[2], '->', process.argv[3]);

    var readStream = fs.createReadStream(process.argv[2]);
    var writeStream = fs.createWriteStream(process.argv[3]);

    readStream.on('data', function (chunk) {
      writeStream.write(chunk);
    });

    readStream.on('end', function () {
      writeStream.end();
    });

    //Some basic error handling
    readStream.on('error', function (err) {
      console.log("ERROR", err);
    });

    writeStream.on('error', function (err) {
      console.log("ERROR", err);
    });
