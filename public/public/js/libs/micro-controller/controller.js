// TODO:
// - Update comments.

;!function(root) {


  // Check server side *require* availability.
  var req = (typeof require !== 'undefined');


  // Require *_* if it's not already present.
  var _ = root._;
  if (!_ && req) _ = require('underscore')._;
  if (!_) throw new Error('Dependency missing: Underscore.');


  // Require *Extendable* if it's not already present.
  var Extendable = root.Extendable;
  if (!Extendable && req) Extendable = require('micro-extendable');
  if (!Extendable) throw new Error('Dependency missing: Extendable.');


  // Require *EventEmitter2* if it's not already present.
  var EventEmitter2 = root.EventEmitter2;
  if (!EventEmitter2 && req) EventEmitter2 = require('micro-eventemiter');
  if (!EventEmitter2) throw new Error('Dependency missing: EventEmitter.');


  // Controller
  var Controller = root.Controller = function Controller(options) {
    options || (options = {});
    this.initialize(options);
  };


  // Set up all inheritable **Controller** properties and methods.
  _.extend(Controller.prototype, EventEmitter2.prototype, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {}

  });


  // Extend Controller with Extendable properties and methods.
  _.extend(Controller, Extendable);


}(typeof exports === 'undefined' ? window : exports); 