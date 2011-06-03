var sys = require('sys'),
   http = require('http'),
 assert = require('assert'),
   path = require('path'),
 events = require('events'),
    url = require('url');

var vows = require('vows');

require.paths.unshift(__dirname, path.join(__dirname, '..'));

var journey = require('lib/journey');

var resources = {
    "home": {
        index: function (res) {
            res.send("honey I'm home!");
        },
        room: function (res, params) {
            assert.equal(params.candles, "lit");
            assert.equal(params.slippers, "on");
            res.send(params);
        }
    },
    "picnic": {
        fail: function () {
            throw "fail!";
        }
    },
    "kitchen": {},
    "recipies": {}
};

//
// Initialize the router
//
var router = new(journey.Router)({
    api: 'basic',
    filter: function (request, body, cb) {
        return request.headers.authorized === true
            ? cb(null)
            : cb(new journey.NotAuthorized('Not Authorized'));
    }
});

router.map(function (map) {
    this.route('GET', 'picnic/fail').bind(resources.picnic.fail);

    //map.root.bind(function (res) { res.send("Welcome to the Root") });
    map.get('/home/room').bind(resources.home.room);
    map.get('/undefined').bind();
    map.get('/unbound');

    map.root.bind(function (res) { return resources.home.index(res) });

    map.get('/').bind(function (res) { res.send(200) });
    map.get('/twice').bind(function (res) { res.send("twice") });
    map.get(/twice/).bind(function (res) { res.send(302) });

    map.path('/domain', function () {
        this.path(/v1/, function () {
            this.root.bind(function (res) { res.send({ root: true, version: 1 }) });
            this.get('').bind(function (res) { res.send({ version: 1 }) });
            this.get('/info').bind(function (res) {
                res.send(200, {}, ['info']);
            });
            this.path('/empty', function () {});
        });
    });

    map.route(['GET', 'PUT'], /^(\w+)$/).
        bind(function (res, r) { return resources[r].index(res) });
    map.route('GET', /^(\w+)\/([0-9]+)$/).
        bind(function (res, r, k) { return resources[r].get(res, k) });
    map.route('PUT', /^(\w+)\/([0-9]+)$/).
        bind(function (res, r, k) { return resources[r].update(res, k) });
    map.route('POST', /^tuple$/).
        bind(function (res, doc) { return resources.tuple(res, doc) });
    map.route('POST', /^(\w+)$/).
        bind(function (res, r, doc) { return resources[r].create(res, doc) });
    map.route('DELETE', /^(\w+)\/([0-9]+)$/).
        bind(function (res, r, k) { return resources[r].destroy(res, k) });

    map.put('home/assert').filter(function (res, req, body) { return body.length === 9; }).
        bind(function (res) { res.send(200, {"Content-Type":"text/html"}, "OK"); });
    
    //
    // Setup a secure portion of the router
    //
    map.get('this_is/secure').filter().
        bind(function (res) { res.send(200, {"Content-Type":"text/html"}, "OK"); });
    
    map.filter(function () {
      map.get('this_is/still_secure').
          bind(function (res) { res.send(200, {"Content-Type":"text/html"}, "OK"); });
    });
            
    map.path('/scoped_auth', function () {
        var asyncAuth = function (request, body, cb) {
            setTimeout(function () {
                return request.headers.admin === true 
                    ? cb(null) 
                    : cb(new journey.NotAuthorized('Not Authorized'));
            }, 200);
        }
      
        this.filter(asyncAuth, function () {
          this.get('/secure').
              bind(function (res) { res.send(200, {"Content-Type":"text/html"}, "OK"); });
        });        
    });
});

var mock = require('lib/journey/mock-request').mock(router);

var get = mock.get,
    del = mock.del,
   post = mock.post,
    put = mock.put;

journey.env = 'test';

vows.describe('Journey').addBatch({
    //
    // SUCCESSFUL (2xx)
    //
    "A valid HTTP request": {
        topic: function () { return get('/', { accept: "application/json" }) },

        "returns a 200": function (res) {
            assert.equal(res.status, 200);
        },
        "returns a body": function (res) {
            assert.equal(res.body.journey, "honey I'm home!");
        }
    },

    "A valid request with multiple Accept types": {
        topic: function () { return get('/', { accept: "text/plain;q=10, application/json" }) },

        "returns a 200": function (res) {
            assert.equal(res.status, 200);
        },
        "returns a body": function (res) {
            assert.equal(res.body.journey, "honey I'm home!");
        }
    },

    "A request with uri parameters": {
        topic: function () {
            // URI parameters get parsed into a javascript object, and are passed to the
            // function handler like so:
            return get('/home/room?slippers=on&candles=lit');
        },

        "returns a 200": function (res) {
            assert.equal(res.status, 200);
        },
        "gets parsed into an object": function (res) {
            assert.equal(res.body.slippers, 'on');
            assert.equal(res.body.candles, 'lit');
        }
    },
    "A request without uri parameters": {
        topic: function () {
            var promise = new(events.EventEmitter);
            router.routes.unshift({
                pattern: /^noparams$/,
                method: 'GET', handler: function (res, params) {
                    promise.emit('success', params);
                }, success: undefined, constraints: []
            });
            router.handle(mock.mockRequest('GET', '/noparams', {}));
            return promise;
        },
        "should pass an empty params object": function (params) {
            assert.isObject(params);
            assert.equal(Object.keys(params).length, 0);
        }
    },

    "A request with two matching routes": {
        topic: function () {
            return get('/twice');
        },

        "returns a 200": function (res) {
            assert.equal(res.status, 200);
        },
        "returns the first matching route": function (res) {
            assert.equal(res.body.journey, 'twice');
        }
    },

    // Here, we're sending a POST request; the input is parsed into an object, and passed
    // to the function handler as a parameter.
    // We expect Journey to respond with a 201 'Created', if the request was successful.
    "A POST request": {
        "with a JSON body": {
            topic: function () {
                resources["kitchen"].create = function (res, input) {
                    res.send("cooking-time: " + (input['chicken'].length + input['fries'].length) + 'min');
                };
                return post('/kitchen', null, JSON.stringify(
                    {"chicken":"roasted", "fries":"golden"}
                ));
            },
            "returns a 201": function (res) {
                assert.equal(res.status, 201);
            },
            "gets parsed into an object": function (res) {
                assert.equal(res.body.journey, 'cooking-time: 13min');
            }
        },
        "with a JSON Array body": {
            topic: function () {
                resources.tuple = function (res, input) {
                    res.send(201, {}, input.join('-'));
                };
                return post('/tuple', null, [1, 2, 3]);
            },
            "returns a 201": function (res) {
                assert.equal(res.status, 201);
            },
            "gets parsed into an object": function (res) {
                assert.equal(res.body.trim(), '1-2-3');
            }
        },
        "with a query-string body": {
            topic: function () {
                resources["kitchen"].create = function (res, input) {
                    res.send("cooking-time: "         +
                            (input['chicken'].length  +
                             input['fries'].length)   + 'min');
                };
                return post('/kitchen', {'accept': 'application/json',
                                        'content-type': 'multipart/form-data'},
                                        "chicken=roasted&fries=golden");
            },
            "returns a 201": function (res) {
                assert.equal(res.status, 201);
            },
            "gets parsed into an object": function (res) {
                assert.equal(res.body.journey, 'cooking-time: 13min');
            }
        }
    },

    //
    // CLIENT ERRORS (4xx)
    //

    // Journey being a JSON only server, asking for text/html returns 'Not Acceptable'
    "A request for text/html": {
        topic: function () {
            return get('/', { accept: "text/html" });
        },
        "returns a 406": function (res) { assert.equal(res.status, 406) }
    },
    // This request doesn't have a matching route, it'll therefore return a 404.
    "A request which doesn't match anything": {
        topic: function () {
            return del('/hello/world');
        },
        "returns a 404": function (res) {
            assert.equal(res.status, 404);
        }
    },
    // This request contains malformed JSON data, the server replies
    // with a 400 'Bad Request'
    "An invalid request": {
        topic: function () {
            return post('/malformed', null, "{bad: json}");
        },
        "returns a 400": function (res) {
            assert.equal(res.status, 400);
        }
    },
    // Trying to access an undefined function will result in a 500,
    // as long as the uri format is valid
    "A route bound to an undefined function": {
        topic: function () {
            return get('/undefined');
        },
        "returns a 500": function (res) {
            assert.equal(res.status, 500);
        }
    },
    // Trying to access an unbound route, will result in a 501 'Not Implemented'
    "An unbound route": {
        topic: function () {
            return get('/unbound');
        },
        "returns a 501": function (res) {
            assert.equal(res.status, 501);
        }
    },
    // Here, we're trying to use the DELETE method on /
    // Of course, we haven't allowed this, so Journey responds with a
    // 405 'Method not Allowed', and returns the allowed methods
    "A request with an unsupported method": {
        topic: function () {
            return del('/');
        },
        "returns a 405": function (res) {
            assert.equal(res.status, 405);
        },
        "sets the 'allowed' header correctly": function (res) {
            assert.equal(res.headers.allow, 'GET');
        }
    },

    //
    // SERVER ERRORS (5xx)
    //

    // The code in `picnic.fail` throws an exception, so we return a
    // 500 'Internal Server Error'
    "A request to a controller with an error in it": {
        topic: function () {
            return get('/picnic/fail');
        },
        "returns a 500": function (res) {
            assert.equal(res.status, 500);
        }
    }
}).addBatch({
    "Scoped routes": {
        "A request to a scope with no routes": {
            topic: function () {
                return get('/domain/v1/empty');
            },
            "returns a 404": function (res) {
                assert.equal(res.status, 404);
            }
        },
        "A request to a scoped route's root": {
            topic: function () {
                return get('/domain/v1/');
            },
            "returns a 200": function (res) {
                assert.equal(res.status, 200);
            },
            "calls the correct route": function (res) {
                assert.equal(res.body.version, 1);
                assert.equal(res.body.root, true);
            }
        },
        "A request to a scoped route's base route": {
            topic: function () {
                return get('/domain/v1');
            },
            "returns a 200": function (res) {
                assert.equal(res.status, 200);
            },
            "calls the correct route": function (res) {
                assert.equal(res.body.version, 1);
                assert.isUndefined(res.body.root);
            }
        },
        "A request to a scoped route": {
            topic: function () {
                return get('/domain/v1/info');
            },
            "returns a 200": function (res) {
                assert.equal(res.status, 200);
            },
            "returns a body": function (res) {
                assert.equal(res.body[0], 'info');
            }
        }
    }
}).addBatch({
    "Secure routes": {
        "A request to a secure route": {
            "when authorized": {
                topic: function () {
                    return get('/this_is/secure', { authorized: true });
                },
                "returns a 200": function (res) {
                    assert.equal(res.status, 200);
                },
                "returns a body": function (res) {
                    assert.equal(res.body, 'OK');
                }
            },
            "when unauthorized": {
                topic: function () {
                    return get('/this_is/secure');
                },
                "returns a 403": function (res) {
                    assert.equal(res.status, 403);
                },
                "returns a body with 'Not Authorized'": function (res) {
                    assert.equal(res.body.error, 'Not Authorized');
                }
            }
        }
    }
}).addBatch({
    "Scoped secure routes using secure()": {
        "A request to a secure route": {
            "when authorized": {
                topic: function () {
                    return get('/this_is/still_secure', { authorized: true });
                },
                "returns a 200": function (res) {
                    assert.equal(res.status, 200);
                },
                "returns a body": function (res) {
                    assert.equal(res.body, 'OK');
                }
            },
            "when unauthorized": {
                topic: function () {
                    return get('/this_is/still_secure');
                },
                "returns a 403": function (res) {
                    assert.equal(res.status, 403);
                },
                "returns a body with 'Not Authorized'": function (res) {
                    assert.equal(res.body.error, 'Not Authorized');
                }
            }
        }
    }
}).addBatch({
    "Scoped secure routes using path()": {
        "A request to a secure route": {
            "when authorized": {
                topic: function () {
                    return get('/scoped_auth/secure', { admin: true });
                },
                "returns a 200": function (res) {
                    assert.equal(res.status, 200);
                },
                "returns a body": function (res) {
                    assert.equal(res.body, 'OK');
                }
            },
            "when unauthorized": {
                topic: function () {
                    return get('/scoped_auth/secure');
                },
                "returns a 403": function (res) {
                    assert.equal(res.status, 403);
                },
                "returns a body with 'Not Authorized'": function (res) {
                    assert.equal(res.body.error, 'Not Authorized');
                }
            }
        }
    }
}).export(module);


