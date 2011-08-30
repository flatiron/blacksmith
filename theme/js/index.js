$(function() {

  var noop = function() {
    return false;
  };
  
  var t;

  $('#toc > ul > li > a').click(function() {
    clearTimeout(t);
    if($(this).hasClass('selected')) {
      return;
    }
    $('#toc > ul > li > ul').hide();
    $(this).next('ul').show();
    $('#toc > ul > li > a').removeClass('selected');
    $(this).addClass('selected');
    $('#mask').fadeIn('fast');
    return false;
  });
  
  //$('#toc > ul > li > ul > li > a').click(noop);

  $('#toc').mouseleave(function() {
    clearTimeout(t);
    t = setTimeout(function() {
      $('#toc > ul > li > ul').hide();
      $('#mask').fadeOut('fast');
      $('a').removeClass('selected');
    }, 400);
  });

});