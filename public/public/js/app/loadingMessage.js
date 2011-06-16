jvdLoadingMessageModel = Backbone.Model.extend({});




jvdLoadingMessageCollection = Backbone.Collection.extend({


    drainTimeout: null,
    model: jvdLoadingMessageModel,


    initialize: function(models, props) {
        var me = this;

        props || (props = {});

        if (props.controller) {
            me.controller = props.controller;
        };

        me.bind('change', me.onChange);

        return me;
    },


    onChange: function(model) {
        var me = this;

        var modelCount = me.length,
            finishedCount = me.select(function(model) {
                if (model.get('_finished')) {
                    return model;
                };
            }).length;

        if(modelCount === finishedCount) {
            me.drainTimeout = setTimeout(function() {
                me.drain();
                me.trigger('drain');
            }, 750);
        };
    },


    drain: function() {
        var me = this;

        // Doesn't work because of bug in Backbone.
        // me.remove(me.models);

        // Because of bug in Backbone call internal function to drain.
        me._reset();

        return me;
    }


});




jvdLoadingMessageCollectionView = Backbone.View.extend({


    initialize: function(options) {
        var me = this;

        me.el = $('<div id="loading-messages"><div><ul></ul></div></div>');

        me.collection.bind('add', function(model) {
            me.addModelView(model);
            me.show();
            me.refresh();
        });
        me.collection.bind('drain', function(model) {
            me.drainView(model);
            me.hide();
        });

        return me;
    },


    events: {
        'tap': 'emptyFn'
    },


    emptyFn: function(e) {
        e.preventDefault();
    },


    render: function() {
        var me = this;

        me.boxEl = me.el.find('> div');
        me.listEl = me.el.find('ul');

        return me;
    },


    addParentView: function(view) {
        var me = this;

        var parentView = me.parentView = view;

        parentView.bind('fixed', function() {
            me.refresh();
        });

        return me;
    },


    show: function() {
        var me = this;

        me.el.show();
        me.trigger('shown');

        return me;
    },


    hide: function() {
        var me = this;

        me.el.hide();
        me.trigger('hidden');

        return me;
    },


    addModelView: function(model) {
        var me = this,
            modelIndex = me.collection.indexOf(model),
            modelView = new jvdLoadingMessageView({'model': model}).render();

        if (modelIndex === 0) {
            me.listEl.append(modelView.el);
        } else {
            me.listEl.find('li:eq(' + (modelIndex - 1) + ')').after(modelView.el);
        };

        return me;
    },


    drainView: function() {
        var me = this;

        me.listEl.children().remove();

        return me;
    },


    refresh: function() {3}


});




jvdLoadingMessageView = Backbone.View.extend({


    el: '<li>',


    initialize: function(options) {
        var me = this;

        me.model.bind('change', function(e) {
            me.update();
        });

        return me;
    },


    render: function() {
        var me = this;

        me.el = $(me.el).html(me.model.get('what') + ' <span>' + me.model.get('action') + '</span>');

        var type = me.model.get('type');
        if (type) me.el.addClass(type);

        return me;
    },


    update: function() {
        var me = this;

        me.el.html(me.model.get('what') + ' <span>' + me.model.get('action') + '</span>');

        var type = me.model.get('type');
        if (type) me.el.addClass(type);

        return me;
    },


    remove: function() {
        this.el.remove();
    }


});