var path = require('path');

require.paths.unshift(__dirname);

var sys = require("sys"),
   http = require("http"),
 events = require('events'),
     fs = require("fs"),
    url = require('url');

var querystring = require('querystring');

var errors = require('journey/errors');

// Escape RegExp characters in a string
var escapeRe = (function () {
    var specials = '. * + ? | ( ) [ ] { } \\ ^ ? ! = : $'.split(' ').join('|\\');
    var re = new(RegExp)('(\\' + specials + ')', 'g');

    return function (str) {
        return (typeof(str) === 'string') ? str.replace(re, '\\$1') : str;
    };
})();

var journey = exports;

journey.env = 'development';
journey.version = [0, 4, 0];
journey.options = {
    strict: false,
    strictUrls: true,
    api: 'http'
};

// Copy error objects to journey.*
for (var k in errors) { journey[k] = errors[k] }

//
// The Router
//
journey.Router = function Router(options) {
    var that = this;

    this.routes = [];
    this.options = mixin({}, journey.options, options || {});

    if (this.options.extension) {
        this.options.extension = this.options.extension.replace('.', '\\.');
    }
};

journey.Router.methods = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'];

journey.Router.prototype = {
    //
    // Define the routing table
    //
    map: function (routes) {
        // Calls the function in the context of this instance,
        // so it can be used to define routes on `this`.
        routes.call(this, this);
    },
    paths: [],
    required: [],

    filter: function (/* variable arguments */) {
        var args = Array.prototype.slice.call(arguments),
            map = (typeof(args[args.length - 1]) === 'function') && args.pop(),
            filter = args.pop() || this.options.filter;

        this.required.push(filter);
        map.call(this, this);
        this.required.pop();
    },

    get:  function (pattern, opts) { return this.route('GET',    pattern, opts) },
    put:  function (pattern, opts) { return this.route('PUT',    pattern, opts) },
    post: function (pattern, opts) { return this.route('POST',   pattern, opts) },
    del:  function (pattern, opts) { return this.route('DELETE', pattern, opts) },

    route: function (/* variable arguments */) {
        if (arguments[0].headers) { throw new(Error)("Router#route method renamed to 'handle'") }

        var that = this, route,
            args = Array.prototype.slice.call(arguments).filter(function (a) { return a }),
            // Defaults
            pattern     = this.paths.length ? '' : /.*/,
            ignoreCase  = false,
            method      = journey.Router.methods.slice(0),
            constraints = [],
            extension   = this.options.extension ? '(?:' + this.options.extension + ')?' : '';

        Array.prototype.push.apply(constraints, this.required);

        args.forEach(function (arg) {
            if (journey.Router.methods.indexOf(arg) !== -1 || Array.isArray(arg)) {
                method = arg;
            } else if (typeof(arg) === "string" || arg.exec) {
                pattern = arg;
            } else {
                throw new(Error)("cannot understand route.");
            }
        });

        if (typeof(pattern) === "string") {
            pattern = escapeRe(pattern);
        } else {
            // If we're in a nested path, '/i' doesn't mean much,
            // as we concatinate strings and regexps.
            ignoreCase = this.paths.length || pattern.ignoreCase;
            pattern = pattern.source;
        }
        // Trim trailing and duplicate slashes and add ^$ markers
        pattern = '^' + this.paths.concat(pattern ? [pattern] : [])
                                  .join('/')
                                  .match(/^\^?(.*?)\$?$/)[1]       // Strip ^ and $
                                  .replace(/^(\/|\\\/)(?!$)/, '')  // Strip root / if pattern != '/'
                                  .replace(/(\/|\\\/)+/g, '/') +   // Squeeze slashes
                                  extension;
        pattern += this.options.strictUrls ? '$' : '\\/?$';     // Add optional trailing slash if requested
        pattern = new(RegExp)(pattern, ignoreCase ? 'i' : '');

        this.routes.push(route = {
            pattern: pattern,
            method: Array.isArray(method) ? method : [method],
            constraints: constraints
        });

        return {
            bind: function (handler) {
                route.handler = handler;
                return route;
            },
            ensure: function (handler) {
                route.constraints.push(handler);
                return this;
            },
            filter: function (handler) {
                return this.ensure(handler || that.options.filter);
            }
        };
    },

    get root() {
        return this.get('/');
    },

    get any() {
        return this.route(/(.*)/);
    },

    path: function (pattern, map) {
        this.paths.push(pattern.exec ? pattern.source
                                     : escapeRe(pattern));
        map.call(this, this);
        this.paths.pop();
    },
    trail: function (from, to) {
        // Logging
    },

    // Called when the HTTP request is 'complete'
    // and ready to be processed.
    handle: function (request, body, callback) {
        var promise = new(events.EventEmitter);
        var request = Object.create(request);
        var that = this;

        request.url = url.parse(request.url);

        // Call the router asynchronously, so we can return a promise
        process.nextTick(function () {
            // Dispatch the HTTP request:
            // As the last argument, we send the function to be called when the response is ready
            // to be sent back to the client -- this allows us to keep our entry and exit point
            // in the same spot. `outcome` is an object with a `status`, a `body` and `headers`
            that.dispatch(request, body || "", function (outcome) {
                outcome.headers["Date"] = new(Date)().toUTCString();
                outcome.headers["Server"] = "journey/" + journey.version.join('.');

                if (outcome.body) {
                    if (typeof(outcome.body) !== 'string') {
                        outcome.headers["Content-Type"] = "application/json";
                        outcome.body = JSON.stringify(outcome.body);
                    }
                    outcome.headers['Content-Length'] = Buffer.byteLength(outcome.body);
                } else {
                    delete(outcome.headers["Content-Type"]);
                }

                if (callback) { callback(outcome) }
                else          { promise.emit("success", outcome) }

                promise.emit("log", {
                  date: new(Date)(),
                  method: request.method,
                  href: request.url.href,
                  outcome: outcome.status
                });
            });
        });
        return promise;
    },

    constraints: [],

    validateRoute: function (route, request, body, allowedMethods, cb) {
        var that = this;

        // Match the pattern with the url
        var match = (function (pattern) {
            var path = request.url.pathname;

            if (! path) { return new(BadRequest) }

            return (path.length > 1 ? path.slice(1) : path).match(pattern);
        })(route.pattern);

        //
        // Return here if no match to avoid potentially expensive
        // async constraint operations.
        //
        if (!Array.isArray(match)) {
            return match === null ? cb(null, false) : cb(match);
        }

        //
        // Run through the specified constraints,
        // asynchronously making sure everything passes.
        //
        (function checkConstraints(constraints) {
            var constraint = constraints.shift();

            if (constraint) {
                // If the constraint is a function then expect it to have a method signature:
                //   asyncConstraint(request, body, callback);
                constraint(request, body, function (err) {
                    if (err) return cb(err);
                    checkConstraints(constraints);
                });
            } else {
                // If there is no handler for this route, return a new NotImplemented exception
                if (! ('handler' in route)) { return cb(new(journey.NotImplemented)("unbound route")) }

                // Otherwise, validate the route method, and return accordingly
                if ((route.method.indexOf(request.method) !== -1) || !route.method) {
                    return cb(null, function (res, params) {
                        var args = [];

                        if (that.options.api === 'http') { args.push(request) }

                        args.push(res);
                        args.push.apply(args, match.slice(1).map(function (m) {
                            return /^\d+$/.test(m) ? parseInt(m) : m;
                        }));
                        args.push(params);
                        return route.handler.apply(this, args);
                    });
                } else {
                    for (var i = 0; i < route.method.length; i++) {
                        if (allowedMethods.indexOf(route.method[i]) === -1) {
                            allowedMethods.push(route.method[i]);
                        }
                    }
                    return cb(null, false);
                }
            }
        })(route.constraints.slice(0));
    },

    resolve: function (request, body, dispatcher) {
        var that = this, allowedMethods = [];
        //
        // Return the first matching route
        //
        (function find(routes, callback) {
            var route = routes.shift();
            if (route) { // While there are still routes to process
                that.validateRoute(route, request, body, allowedMethods, function (err, found, method) {
                    if      (err)   { dispatcher(err) }
                    else if (found) { dispatcher(null, found) }
                    else            { find(routes, callback) }
                });
            } else if (allowedMethods.length) {
                dispatcher(new(journey.MethodNotAllowed)(allowedMethods.join(',')));
            } else {
                dispatcher(null, false);
            }
        })(this.routes.slice(0));
    },

    verifyHeaders: function (request, respond) {
        var accepts = request.headers.accept;
        accepts = accepts && accepts.split(/[,;] */);

        // Journey being a JSON-only server, we expect the 'Accept' header
        // to be set accordingly.
        if (this.options.strict) {
            if (!accepts || accepts.indexOf("application/json") === -1) { return false }
        } else {
            if (accepts && accepts.indexOf("application/json") === -1 &&
                           accepts.indexOf("*/*") === -1) { return false }
        }
        return true;
    },

    // This function glues together the request resolver, with the responder.
    // It creates a new `route` context, in which the response will be generated.
    dispatch: function (request, body, respond) {
        var route, parser, that = this,
        params = querystring.parse(request.url.query || null);

        if (! this.verifyHeaders(request)) {
            return respond(new(journey.NotAcceptable)(request.headers.accept));
        }

        this.resolve(request, body, function (err, resolved) {
            if (err) {
                if (err.status) { // If it's an HTTP Error
                    return respond({
                        headers: err.headers || {},
                        status: err.status,
                        body: JSON.stringify(err.body)
                    });
                } else {
                    throw err;
                }
            }

            route = that.draw(request, respond);

            if (resolved) {
                if (body) {
                    parser = /^application\/json/.test(
                        request.headers["content-type"]
                    ) ? JSON.parse : querystring.parse;

                    try {
                        body = parser(body);
                    } catch (e) {
                        return respond(new(journey.BadRequest)("malformed data"));
                    }

                    // If the body is an Array, we want to return params as an array,
                    // else, an object. The `mixin` function will preserve the type
                    // of its first parameter.
                    params = Array.isArray(body) ? mixin(body, params) : mixin(params, body);
                }
                return route.go(resolved, params);
            } else {
                return respond(new(journey.NotFound)("request not found"));
            }
        });
    },

    // A constructor of sorts, which returns a 'Routing context', in which the response
    // status is evaluated.
    draw: function (req, respond) {
        var that = this;

        return {
            request: req,
            respond: respond,
            baseResponse: {
                status: req.method == 'POST' ? 201 : 200,
                body: "",
                headers: {"Content-Type" : "application/json"}
            },

            // A wrapper around `respond()`, it allows us to respond in a variety of
            // ways, such as: `201`, `"Hello World"`, `[201, "Hello", {'Content-Type':'text/html'}]`, etc.
            // All parameters are optional.
            responder: function (response) {
                // If more than one argument was received, treat it as if it was an array.
                if (arguments.length > 1) { response = Array.prototype.slice.apply(arguments) }

                this.respond((function (baseResponse) {
                    switch (typeOf(response)) {
                        case "object":
                            return mixin({}, baseResponse, { body: response });
                        case "string":
                            return mixin({}, baseResponse, { body: { journey: response } });
                        case "number":
                            return mixin({}, baseResponse, { status: response });
                        case "array":
                            if (response.length === 3) {
                                return {
                                    status:  response[0],
                                    headers: response[1],
                                    body:    response[2]
                                };
                            } else {
                                throw new(Error)("expected 3 elements in response");
                            }
                        default:
                            throw new(Error)("wrong response type");
                    }
                })(this.baseResponse));
            },

            sendBody: function (body) {
                this.respond(mixin({}, this.baseResponse, { body: body }));
            },

            sendJSONP: function (name, result) {
                this.respond(mixin({}, this.baseResponse, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/javascript"
                    },
                    body: name + "(" + JSON.stringify(result) + ")"
                }));
            },

            sendHeaders: function (status, headers) {
                this.respond(mixin({}, this.baseResponse, { status: status, headers: headers }));
            },

            go: function (destination, params) {
                this.send = this.responder;

                try {
                    destination.call(this, this, params || {});
                } catch (err) {
                    this.respond({
                        body: { error: err.message || err,
                        stack: err.stack && err.stack.split('\n') },
                        status: err.status || 500, headers: {}
                    });
                }
            }
        }
    }
};

//
// Utility functions
//
function typeOf(value) {
    var s = typeof(value),
        types = [Object, String, RegExp, Number, Function, Boolean, Date];

    if (Array.isArray(value)) {
        return 'array';
    } else if (s === 'object' || s === 'function') {
        if (value) {
            types.forEach(function (t) {
                if (value instanceof t) { s = t.name.toLowerCase() }
            });
        } else { s = 'null' }
    }
    return s;
}
function mixin(target) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (a) {
        var keys = Object.keys(a);
        for (var i = 0; i < keys.length; i++) {
            target[keys[i]] = a[keys[i]];
        }
    });
    return target;
}

