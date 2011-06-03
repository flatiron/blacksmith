var url = require('url'),
    sys = require('sys'),
    events = require('events');

var router = null,
    defaultHeaders = { "accept"      :"application/json",
                       "content-type":'application/json; charset=UTF-8' };
var mock = {
    mockRequest: function (method, path, headers) {
        var uri = url.parse(path || '/');

        headers = headers || {};

        for (var k in defaultHeaders) { headers[k] = headers[k] || defaultHeaders[k] }

        return {
            listeners: [],
            method: method,
            headers: headers,
            url: uri,
            setBodyEncoding: function (e) { this.bodyEncoding = e },
            addListener: function (event, callback) {
                this.listeners.push({ event: event, callback: callback });
                if (event == 'data') {
                    var body = this.body;
                    this.body = '';
                    callback(body);
                } else { callback() }
            }
        };
    },
    request: function (method, path, headers, body) {
        var promise = new(events.EventEmitter);
        var result = router.handle(this.mockRequest(method, path, headers),
                                   typeof(body) === 'object' ? JSON.stringify(body) : body);

        result.addListener('success', function (res) {
            try {
                if (res.body) { res.body = JSON.parse(res.body) }
            } catch (_) {}
            promise.emit('success', res);
        });
        return promise;
    }
}

exports.mock = function (instance) {
    router = instance;
    return this;
};
exports.mockRequest = mock.mockRequest;

// Convenience functions to send mock requests
exports.get  = function (p, h)    { return mock.request('GET',    p, h) }
exports.del  = function (p, h)    { return mock.request('DELETE', p, h) }
exports.post = function (p, h, b) { return mock.request('POST',   p, h, b) }
exports.put  = function (p, h, b) { return mock.request('PUT',    p, h, b) }

