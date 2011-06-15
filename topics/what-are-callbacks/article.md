What are callbacks?

In a synchronous program, you would write something along the lines of:

    function process_data () {
      var data = fetch_data ();
      data += 1;
      return data;
    }

This works just fine and is very typically in other development environments. However, if fetch_data takes a long time to load the data (maybe it is streaming it off the drive or the internet), then this causes the whole program to block until it loads the data. So node.js uses callbacks to prevent any blocking, so the node.js way would look a bit more like this:

    function process_data (callback) {
      fetch_data(function (err, data) {
        if (err) {
          console.log("An error has occured. Abort everything!");
          callback(err);
        }
        data += 1;
        callback(data);
      });
    }

At first glance, it may look unnecessarily complicated, but callbacks are the foundation to node.js. The callbacks allow you to have more or less an unlimited IO operations happening at the same time. For example, a web server with 100s-100s of pending requests with multiple blocking queries, the ability to be able to continue working and wait until the blocking operations come back is a major optimization. 

The typically convention with asynchronous function (which almost all of your functions should be):

    function async_operation ( a, b, c, callback ) {
      // ... lots of hard work ...
      if ( /* an error occurs */ ) {
        callback(new Error("An error has occured"));
      }
      // ... more work ...
      callback(null, d, e, f);
    }

    async_operation ( params.., function ( err, return_values.. ) {
       //This code gets run after the async operation gets run
    });

The general idea is that the callback is the last parameter. The callback gets called after the function is done with all of its operations. Traditionally, the first parameter of the callback is the `error` value. If the function hits an error, then they typically call the callback with the first parameter being an Error object. If it cleanly exits, then they will call the callback with the first parameter being null and the rest being the return value(s). You want almost always want to follow the callback convention since everyone expects your project to follow them.
