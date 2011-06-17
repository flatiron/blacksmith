AppView = View.extend({


    initialize: function(props, classProps) {
      var me = this;

      me.id = 'app-view';

      return me;
    },


    render: function() {
      var me = this;

      var platform = $.platform();

      $.fixBody({'platform': platform});

      // me.el = $('body');
      // me.el.attr({'data-cid': me.cid});
      // 
      // me.el.bind('ready', function(e) {
      //   me.trigger('appview:ready', me);
      // });
      // me.el.bind('fixed', function(e) {
      //   me.trigger('appview:fixed', me);
      // });

      return me;
    }


});