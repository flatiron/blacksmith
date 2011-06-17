// AppController = MicroController.extend({
// 
//     initialize: function(options) {
//       var me = this;
// 
//       _.extend(me, options);
// 
//       me
//         .initTemplates()
//         .initSocket()
//         .initRegister()
//         .initView()
//         .initListeners();
// 
//       return me;
//     },
// 
//     initTemplates: function() {
//       var me = this;
// 
//       function error(jqXHR, textStatus, errorThrown) {
//         throw new Error('Templates not loaded. Error: ' + errorThrown);
//       };
// 
//       function success(data, textStatus, jqXHR) {
//         var tempTemplates = $('<div>').append(data).children();
// 
//         tempTemplates
//           .each(function(i, template) {
//             var myTemplate = $(template);
//             $.templates(myTemplate.attr('id'), myTemplate.text());
//           })
//           .remove();
// 
//         me._templatesReady = true;
//         me.afterInit();
//       };
// 
//       $.ajax({
//         dataType: 'text',
//         error: error,
//         success: success,
//         url: '/js/app/templates.js'
//       });
// 
//       return me;
//     },
// 
// 
//     initSocket: function() {
//       var me = this,
//           constants = window.constants;
// 
//       var hostname = constants['SOCKET_HOST_NAME'],
//           socket = me.socket = socket = new io.Socket(hostname, constants['SOCKET_OPTIONS']),
//           connectionTimeout = setTimeout(function() {
//             throw new Error('Socket not Connected. Error: Time Out');
//           }, 2500);
// 
//       socket.connect();
// 
//       socket.on('connect', function() {
//         clearTimeout(connectionTimeout);
//         me._socketReady = true;
//         me.afterInit();
//       });
// 
//       socket.on('message', function(message) {
//         console.log('Socket Message: ', message);
//       });
// 
//       return me;
//     },
// 
// 
//     initRegister: function() {
//       var me = this;
// 
//       me._registerReady = true;
//       me.afterInit();
// 
//       return me;
//     },
// 
// 
//     initView: function() {
//       var me = this;
// 
//       me._viewReady = true;
//       me.afterInit();
// 
//       return me;
//     },
// 
// 
//     initListeners: function() {
//       var me = this;
// 
//       me._listenersReady = true;
//       me.afterInit();
// 
//       return me;
//     },
// 
// 
//     afterInit: function() {
//       var me = this;
// 
//       if(me._templatesReady && me._socketReady && me._registerReady && me._listenersReady && me._viewReady && !me.initialized) {
//         me.initialized = true;
//         me.initControllers();
//       };
// 
//       return me;
//     },
// 
// 
//     initControllers: function() {
//       var me = this;
// 
//       var options = {appController: me};
// 
//       // me....Controller = new ...Controller(options);
//       // console.log('initControllers');
// 
//       return me;
//     }
// 
// 
// });