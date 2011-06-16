jvdController = Backbone.Controller.extend({


    initialize: function(props, classProps) {
        var me = this;

        me
        .initConstants()
        .initCollections()
        .initViews()
        .loadTemplates()
        .loadVideoCollection()
        .initSocket();

        Backbone.history.start();

        return me;
    },


    routes: {
        'preview/:id': 'previewVideo',
        'play/:id': 'playVideo'
    },


    afterInit: function() {
        var me = this;

        if(me._templatesLoaded && me._videoCollectionLoaded && me._socketConnected) {
            me.setupInterface();
        };

        return me;
    },


    initConstants: function() {
        var me = this;

        var constants = me.constants = {},
            supportTouch = ('ontouchstart' in window);

        constants['SOCKET_HOST_NAME'] = window.location.hostname;
        constants['SOCKET_OPTIONS'] = {'port': window.location.port || 80};
        constants['INPUT_EVENT'] = 'tap';
        constants['INPUT_START_EVENT'] = supportTouch ? 'touchstart' : 'mousedown';
        constants['INPUT_STOP_EVENT'] = supportTouch ? 'touchend' : 'mouseup';
        constants['INPUT_MOVE_EVENT'] = supportTouch ? 'touchmove' : 'mousemove';

        return me;
    },


    initCollections: function() {
        var me = this;

        var props = {'controller': me};

        me.videoCollection = new jvdVideoCollection(null, props);
        me.loadingMessagesCollection = new jvdLoadingMessageCollection(null, props);

        return me;
    },


    initViews: function() {
        var me = this;

        var controllerView = me.controllerView = new jvdControllerView(),
            loadingMessageView = me.loadingMessageView = new jvdLoadingMessageCollectionView({'collection': me.loadingMessagesCollection});

        controllerView.render();
        loadingMessageView.render();

        loadingMessageView.unbind().bind('hidden', function(){
            me.afterInit();
            loadingMessageView.unbind();
        });

        controllerView.addView(loadingMessageView);

        return me;
    },


    initSocket: function() {
        var me = this;

        var hostname = me.constants['SOCKET_HOST_NAME'],
            socket = me.socket = new io.Socket(hostname, me.constants['SOCKET_OPTIONS']);

        var message = new jvdLoadingMessageModel({
            'what': 'socket',
            'action': 'connecting'
        });
        me.loadingMessagesCollection.add(message);

        socket.connect();

        socket.on('connect', function() {
            message.set({
                'action': 'connected',
                '_finished': true
            });
            me._socketConnected = true;
        });

        return me;
    },


    loadTemplates: function() {
        var me = this;

        var message = new jvdLoadingMessageModel({
            'what': 'templates',
            'action': 'loading'
        });
        me.loadingMessagesCollection.add(message);

        $('<div>').load('/js/app/templates.js', function(data, status, xhr) {
            setTimeout(function() {
                message.set({'action': 'parsing'});
                $(data).each(function(i, template) {
                    var myTemplate = $(template);
                    $.template(myTemplate.attr('id'), myTemplate.text());
                });
            }, 0);
            setTimeout(function() {
                message.set({
                    'action': 'loaded & parsed',
                    '_finished': true
                });

                me._templatesLoaded = true;
            }, 10);
        }).remove();

        return me;
    },


    loadVideoCollection: function() {
        var me = this;

        var message = new jvdLoadingMessageModel({
            'what': 'video collection',
            'action': 'loading'
        });
        me.loadingMessagesCollection.add(message);

        function internalSuccessCallback(data, textStatus, jqXHR) {
            message.set({
                'action': 'loaded',
                '_finished': true
            });
            me.videoCollection.add(data.entry || [], {'silent': true});
            me._videoCollectionLoaded = true;
        };

        function internalErrorCallback(jqXHR, textStatus, errorThrown) {
            message.set({'action': 'loading error'});
        };

        $.ajax({
            url: '/youtube/standard_feeds/most_viewed?max-results=50',
            success: internalSuccessCallback,
            error: internalErrorCallback
        });

        return me;
    },


    setupInterface: function() {
        var me = this;

        var videoCollectionView = me.videoCollectionView = new jvdVideoCollectionView({'collection': me.videoCollection});

        videoCollectionView.preRender().render();
        me.controllerView.addView(videoCollectionView);
        videoCollectionView.afterRender();

        return me;
    },


    playVideo: function(id) {
        console.log(id);
    }


});




jvdControllerView = Backbone.View.extend({


    render: function() {
        var me = this;

        var platform = $.platform();

        $.fixBody({
            'platform': platform
        });
        me.el = $('body');

        me.el.bind('fixed', function(e) {
            me.trigger('fixed');
        });

        return me;
    },


    addView: function(view) {
        var me = this;

        me.el.append(view.el);

        view.addParentView(me);

        return me;
    }


});