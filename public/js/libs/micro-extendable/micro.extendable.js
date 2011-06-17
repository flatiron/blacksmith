// TODO:
// - Update comments.

;!function(root) {

  // Check server side *require* availability.
  var req = (typeof require !== 'undefined');

  // Require *_* if it's not already present.
  var _ = root._;
  if (!_ && req) _ = require('underscore')._;
  if (!_) throw new Error('Dependency missing: Underscore.');

  // MicroExtendable
  var MicroExtendable = root.MicroExtendable = function MicroExtendable() {};

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function() {};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined (the
    // "constructor" property in the `extend` definition), or defaulted to
    // simply call *super*.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // The self-propagating extend function.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Add `extend` function to MicroExtendable and make it available to the outside
  // world.
  MicroExtendable.extend = extend;

}(typeof exports === 'undefined' ? window : exports);