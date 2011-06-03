journey
=======

> liberal JSON-only HTTP request routing for node.

introduction
------------

Journey's goal is to provide a *fast* and *flexible* *RFC 2616 compliant* request router
for *JSON* consuming clients.

synopsis
--------

    var journey = require('journey');

    //
    // Create a Router
    //
    var router = new(journey.Router);

    // Create the routing table
    router.map(function () {
        this.root.bind(function (req, res) { res.send("Welcome") });
        this.get(/^trolls\/([0-9]+)$/).bind(function (req, res, id) {
            database('trolls').get(id, function (doc) {
                res.send(200, {}, doc);
            });
        };
        this.post('/trolls').bind(function (req, res, data) {
            sys.puts(data.type); // "Cave-Troll"
            res.send(200);
        });
    });

    require('http').createServer(function (request, response) {
        var body = "";

        request.addListener('data', function (chunk) { body += chunk });
        request.addListener('end', function () {
            //
            // Dispatch the request to the router
            //
            router.handle(request, body, function (result) {
                response.writeHead(result.status, result.headers);
                response.end(result.body);
            });
        });
    }).listen(8080);

installation
------------

    $ npm install journey

API
---

You create a router with the `journey.Router` constructor:

    var router = new(journey.Router);

You define some routes, with bound functions:

    router.get('/hello').bind(function (req, res) { res.send('Hi there!') });
    router.put('/candles').bind(function (req, res) { ... });

*Note that you may also use the `map` function to define routes.*

The `router` object exposes a `handle` method, which takes three arguments:
an `http.ServerRequest` instance, a body, and a callback, as such:

    function route(request, body, callback)

and asynchronously calls the callback with an object containing the response
headers, status and body, on the first matching route:

    { status: 200,
      headers: {"Content-Type":"application/json"},
      body: '{"journey":"Welcome"}'
    }

Note that the response body will either be JSON data, or empty.

### Routes #

Here are a couple of example routes:

    // route                                // matching request
    router.get('/users')                    // GET    /users
    router.post('/users')                   // POST   /users
    router.del(/^users\/(\d+)$/)            // DELETE /users/45
    router.put(/^users\/(\d+)$/)            // PUT    /users/45

    router.route('/articles')               // *           /articles
    router.route('POST',          '/users') // POST        /users
    router.route(['POST', 'PUT'], '/users') // POST or PUT /users

    router.root                             // GET /
    router.any                              // Matches all request
    router.post('/', {                      // Only match POST requests to /
        assert: function (req) {         // with data in the body.
            return req.body.length > 0;
        }
    });

Any of these routes can be bound to a function or object which responds
to the `apply` method. We use `bind` for that:

    router.get('/hello').bind(function (req, res) {});

If there is a match, the bound function is called, and passed the `response` object,
as first argument. Calling the `send` method on this object will trigger the callback,
passing the response to it:

    router.get('/hello').bind(function (req, res) {
        res.send(200, {}, {hello: "world"});
    });

The send method is pretty flexible, here are a couple of examples:

                                // status, headers, body
    res.send(404);              // 404     {}       ''
    res.send("Welcome");        // 200     {}       '{"journey":"Welcome"}'
    res.send({hello:"world"});  // 200     {}       '{"hello":"world"}'

    res.send(200, {"Server":"HAL/1.0"}, ["bob"]);

As you can see, the body is automatically converted to JSON, and if a string is passed,
it acts as a message from `journey`. To send a raw string back, you can use the `sendBody` method:

    res.sendBody(JSON.stringify({hello:"world"}));

This will bypass JSON conversion.

### URL parameters #

Consider a request such as `GET /users?limit=5`, I can get the url params like this:

    router.get('/users').bind(function (req, res, params) {
        params.limit; // 5
    });

How about a `POST` request, with form data, or JSON? Same thing, journey will parse the data,
and pass it as the last argument to the bound function.

### Capture groups #

Any captured data on a matched route gets passed as arguments to the bound function, so let's
say we have a request like `GET /trolls/42`, and the following route:

    get(/^([a-z]+)\/([0-9]+)$/)

Here's how we can access the captures:

    router.get(/^([a-z]+)\/([0-9]+)$/).bind(function (req, res, resource, id, params) {
        res;      // response object
        resource; // "trolls"
        id;       // 42
        params;   // {}
    });

### Summary #

A bound function has the following template:

    function (request, responder, [capture1, capture2, ...], data/params)

### Paths #

Sometimes it's useful to have a bunch of routes under a single namespace, that's what the `path` function does.
Consider the following path and unbound routes:

    router.path('/domain', function () {
        this.get();        // match 'GET /domain'
        this.root;         // match 'GET /domain/'
        this.get('/info'); // match 'GET /domain/info'

        this.path('/users', function () {
            this.post();   // match 'POST /domain/users'
            this.get();    // match 'GET  /domain/users'
        });
    })

### Filters #

Often it's convenient to disallow certain requests based on predefined criteria. A great example of this is Authorization:

    function authorize (request, body, cb) {
      return request.headers.authorized === true
          ? cb(null)
          : cb(new journey.NotAuthorized('Not Authorized'));
    }

    function authorizeAdmin (request, body, cb) {
      return request.headers.admin === true
          ? cb(null)
          : cb(new journey.NotAuthorized('Not Admin'));
    }

Journey exposes this in three separate location through the `filter` API:

#### Set a global filter

    var router = new(journey.Router)({ filter: authorize });

*Note: This filter will not actually be enforced until you use the APIs exposed in (2) and (3)*

#### Set a scoped filter in your route function

    var router = new(journey.Router)({ filter: authorize });

    router.map(function () {
        this.filter(function () {
            //
            // Routes in this scope will use the 'authorize' function
            //
        });

        this.filter(authorizeAdmin, function () {
            //
            // Routes in this scope will use the 'authorizeAdmin' function
            //
        });
    });

#### Set a filter on an individual route

    var router = new(journey.Router)({ filter: authorize });

    router.map(function () {
        this.get('/authorized').filter().bind(function (req, res, params) {
            //
            // This route will be filtered using the 'authorize' function
            //
        });

        this.get('/admin').filter(authorizeAdmin).bind(function (req, res, params) {
            //
            // This route will be filtered using the 'authorizeAdmin' function
            //
        });
    });

### Accessing the request object #

From a bound function, you can access the request object with `this.request`, consider
a request such as `POST /articles`, and a route:

    router.route('/articles').bind(function (req, res) {
        this.request.method; // "POST"
        res.send("Thanks for your " + this.request.method + " request.");
    });

license
-------

Released under the Apache License 2.0

See `LICENSE` file.

Copyright (c) 2010 Alexis Sellier


