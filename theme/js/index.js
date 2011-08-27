$(function() {

  var noop = function() {
    return false;
  };
  
  var t;

  $('#toc > ul > li > a').mouseenter(function() {
    clearTimeout(t);
    if($(this).hasClass('selected')) {
      return;
    }
    $('#toc > ul > li > a').removeClass('selected');
    $(this).addClass('selected');
    $('#toc > ul > li > ul').hide().css({'opacity': 0, 'left': 0});
    $(this).next('ul').show().animate({'opacity': 1, 'left': 200}, 200);
    $('#mask').fadeIn('fast');

  }).click(noop);
  
  $('#toc > ul > li > ul > li > a').click(noop);

  $('#toc > ul').mouseleave(function() {
    clearTimeout(t);
    t = setTimeout(function() {
      $('#toc > ul > li > ul').hide().css({'opacity': 0, 'left': 0});
      $('#mask').fadeOut('fast');

      $('a').removeClass('selected');
    }, 400);
  });

});