$(document).ready(function() {

    ;!function setConstants() {
        var constants = window.constants = {},
            supportTouch = ('ontouchstart' in window);
    
        constants['SOCKET_HOST_NAME'] = window.location.hostname;
        constants['SOCKET_OPTIONS'] = {'port': window.location.port || 80};
        constants['INPUT_EVENT'] = supportTouch ? 'tap' : 'click';
        constants['INPUT_START_EVENT'] = supportTouch ? 'touchstart' : 'mousedown';
        constants['INPUT_STOP_EVENT'] = supportTouch ? 'touchend' : 'mouseup';
        constants['INPUT_MOVE_EVENT'] = supportTouch ? 'touchmove' : 'mousemove';
    }();

    // Configure Micro Libraries by mixin' & matchin'
    var props = { MicroExtentable: MicroExtendable },
        protoProps = { EventEmitter2: EventEmitter2 };

    MicroController.mixin(props, protoProps);
    MicroView.mixin(props, protoProps);

});