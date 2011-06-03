//
// HTTP Error objectst
//
this.BadRequest = function (msg) {
    this.status = 400;
    this.headers = {};
    this.body = { error: msg };
};
this.NotFound = function (msg) {
    this.status = 404;
    this.headers = {};
    this.body = { error: msg };
};
this.MethodNotAllowed = function (allowed) {
    this.status = 405;
    this.headers = { allow: allowed };
    this.body = { error: "method not allowed." };
};
this.NotAcceptable = function (accept) {
    this.status = 406;
    this.headers = {};
    this.body = {
        error: "cannot generate '" + accept + "' response",
        only: "application/json"
    };
};
this.NotImplemented = function (msg) {
    this.status = 501;
    this.headers = {};
    this.body = { error: msg };
};
this.NotAuthorized = function (msg) {
    this.status = 403;
    this.headers = {};
    this.body = { error: msg || 'Not Authorized' };
};
