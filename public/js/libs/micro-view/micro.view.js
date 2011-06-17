// TODO:
// - Update comments.

;!function(root) {

  // Check server side *require* availability.
  var req = (typeof require !== 'undefined');

  // Require *_* if it's not already present.
  var _ = root._;
  if (!_ && req) _ = require('underscore')._;
  if (!_) throw new Error('Dependency missing: Underscore.');

  // Require *$* if it's not already present.
  var $ = root.$ || root.jQuery;
  if (!$ && req) $ = require('jquery');
  if (!$) throw new Error('Dependency missing: jQuery.');

  // MicroView
  var MicroView = root.MicroView = function MicroView(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.delegateEvents();
    this.initialize(options);
  };

  // Set up all inheritable *MicroView* properties and methods.
  _.extend(MicroView.prototype, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // Attach the `selectorDelegate` function as the `$` property.
    $: selectorDelegate,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {},

    // *render* is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for *render* to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      $(this.el).remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use *make* to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Set callbacks, where `this.callbacks` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = this.events))) return;
      $(this.el).unbind('.delegateEvents' + this.cid);
      for (var key in events) {
        var methodName = events[key];
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        var method = _.bind(this[methodName], this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          $(this.el).bind(eventName, method);
        } else {
          $(this.el).delegate(selector, eventName, method);
        }
      }
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` proeprties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = this.attributes || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.el = this.make(this.tagName, attrs);
      } else if (_.isString(this.el)) {
        this.el = $(this.el).get(0);
      }
    }

  });


  // Extend View with Extendable properties and methods.
  _.extend(MicroView, Extendable);




  // HELPERS


  // Element lookup, scoped to DOM elements within the current view.
  // This should be prefered to global lookups, if you're dealing with
  // a specific view.
  var selectorDelegate = function(selector) {
    return $(selector, this.el);
  };


  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\S+)\s*(.*)$/;


  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];


}(typeof exports === 'undefined' ? window: exports);