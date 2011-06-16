jvdVideoModel = Backbone.Model.extend({


    initialize: function(attrs, props) {
        var me = this;

        var fieldCount = attrs['id']['$t'].split('/').length;

        me.id = attrs['id']['$t'].split('/')[fieldCount - 1];

        return me;
    },


    loadFileList: function() {
        var me = this;

        if (!me.get('fileList')) {
            function internalSuccessCallback(data, textStatus, jqXHR) {
                me.set({'fileList': data.fileList});
                me.setFile();
                me.trigger('loading:filelist:end');
            };

            function internalErrorCallback(jqXHR, textStatus, errorThrown) {
                me.trigger('loading:filelist:end');
            };

            me.trigger('loading:filelist:start');

            $.ajax({
                url: '/youtube/filelist/' + me.id,
                success: internalSuccessCallback,
                error: internalErrorCallback
            });
        };

        return me;
    },


    setFile: function() {
        var me = this,
            platformFile,
            fileList = me.get('fileList'),
            validFileFormats = [18, 22, 37, 38], // Add webM support with file formats 43 and 45.
            maxFileFormats = {
                'phone': 18,
                'tablet': 22,
                'desktop': 38 // Add webM support with file format 45.
            },
            platform = $.platform().desktop || $.platform().tablet || $.platform().phone,
            maxFileFormat = maxFileFormats[platform];

        // Considers the file list to be sorted ASC and loop it accordingly.
        _.each(fileList, function(file, index) {
            var fileFormat = ~~file.format;

            if (_.indexOf(validFileFormats, fileFormat) > -1) {
                if (!platformFile || platformFile.format < fileFormat) {
                    platformFile = file;
                };
            };
        });

        me.set({'platformFile': platformFile});

        return me;
    }


});




jvdVideoCollection = Backbone.Collection.extend({


    model: jvdVideoModel,


    initialize: function(models, props) {
        var me = this;

        props || (props = {});

        if (props.controller) {
            me.controller = props.controller;
        };

        return me;
    }


});




jvdVideoCollectionView = Backbone.View.extend({


    initialize: function(options) {
        var me = this;

        me.el = $.tmpl('video-collection');
        me.reelEl = me.el.find('#reel');
        me.initEvents();
        me.delegateEvents();

        return me;
    },


    initEvents: function() {
        var me = this;

        var constants = me.collection.controller.constants,
            events = me.events = {};

        events[constants['INPUT_EVENT'] + ' .video'] = 'onChildElInput';

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


    preRender: function() {
        var me = this;

        me.collection.each(function(model, index) {
            var modelEl = new jvdVideoView({
                model: model
            }).render().el;

            me.reelEl.append(modelEl);
        });

        return me;
    },


    afterRender: function() {
        var me = this;

        me.reelEl.fauxScroll({
            desktopCompatibility: true,
            verticalScroll: false
        });
        me.refresh();

        return me;
    },


    refresh: function() {
        var me = this;

        var childElWidth = 0;

        me.reelEl.children().each(function(index, childEl) {
            var myChildEl = $(childEl);

            childElWidth += myChildEl.width();
            childElWidth += parseInt(myChildEl.css('padding-right'));
            childElWidth += parseInt(myChildEl.css('padding-left'));
            childElWidth += parseInt(myChildEl.css('margin-right'));
            childElWidth += parseInt(myChildEl.css('margin-left'));
        });

        me.reelEl.width(childElWidth);
        me.reelEl.fauxScroll('refresh');

        return me;
    },


    onChildElInput: function(e) {
        var me = this,
            targetEl = $(e.currentTarget),
            modelID = targetEl.attr('id').replace('video-', '');

        window.location.hash = 'play/' + modelID;
    }


});






jvdVideoView = Backbone.View.extend({


    initialize: function(options) {
        var me = this;

        return me;
    },


    render: function() {
        var me = this;

        me.el = $.tmpl('video', me.prepareData());

        return me;
    },


    prepareData: function() {
        var me = this;

        var img = _.select(me.model.get('media$group')['media$thumbnail'], function(img) {
                if (img.width && img.width >= 320) return img;
            })[0].url;

        return {
            id: me.model.id,
            title: me.model.get('title')['$t'],
            img: img
        };
    },


    onLoading: function(type) {
        this.el.toggleClass('loading');
    }


});