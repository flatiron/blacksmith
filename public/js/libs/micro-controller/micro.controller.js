// TODO:
// - Update comments.

;!function(root) {

  // Check server side *require* availability.
  var req = (typeof require !== 'undefined');

  // Require *_* if it's not already present.
  var _ = root._;
  if (!_ && req) _ = require('underscore')._;
  if (!_) throw new Error('Dependency missing: Underscore.');

  // MicroController
  var MicroController = root.MicroController = function MicroController(options) {
    options || (options = {});
    if (this.initialize) this.initialize(options);
  };

  // Set up all inheritable *MicroController* properties and methods.
  _.extend(MicroController.prototype, {

    // Overridable with custom initialization logic.
    initialize: function() {}
  });

  MicroController.mixin = function(props, protoProps) {
    for (var objs in props) {
      var obj = props[objs];
      _.extend(this, obj);
    }
    for (var objs in protoProps) {
      var obj = protoProps[objs];
      _.extend(this.prototype, obj.prototype);
    }
    return this;
  };

}(typeof exports === 'undefined' ? window : exports); 