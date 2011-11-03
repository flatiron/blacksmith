$(function() {
  
  var selectingTopicTimer,
      selectingSubtopicTimer,
      selected;

  //
  // When the user clicks on a topic,
  // assume the intent is top open the ToC
  //
  $('#toc > ul > li > a').click(function(e) {

    //
    // If the ToC is shallow enough, the "top" will actually be an article and
    // not a category.
    //
    if ($(e).html() !== null) {
      clearTimeout(selectingTopicTimer);

      var topic = this;

      //
      // Don't re-open the same topic twice
      //
      if($(topic).hasClass('selected')) {
        // console.log('already selected, dont reopen');
        return false;
      }

      openTopic(topic);
      return false;
    }
    return true;
  });

  //
  // Touch support. Since there is no mouse out on
  // touch devices, we need to have an event to hide
  // the toc.
  //
  $('#article').click(function() {
    $('#toc').mouseleave();
  });

  //
  // When the user's mouse leaves the ToC,
  // assume the intent is to close the ToC
  //
  $('#toc').mouseleave(function(e){
    clearTimeout(selectingTopicTimer);
    selectingTopicTimer = setTimeout(function() {
      closeTopic();
    }, 400);
  });

  //
  // For users with an impatient intent,
  // instantly close ToC if they click anywhere outside the ToC
  //
  $('body').click(function(e){
    if($(e.target).get(0).tagName !== 'UL'){
      if(isTopicSelected()){
        closeTopic();
      }
    }
  });

  //
  // Opens the Table Of Contents
  //
  function openTopic(topic) {
    $('#toc > ul > li > ul').hide();
    $(topic).next('ul').show();
    $('#toc > ul > li > a').removeClass('selected');
    $(topic).addClass('selected');
    $('#mask').fadeIn('fast');
  }

  //
  // Closes the Table Of Contents
  //
  function closeTopic() {
    $('#toc > ul > li > ul').hide();
    $('#mask').fadeOut('fast');
    $('a').removeClass('selected');
  }

  function isTopicSelected() {
    if($('#toc > ul > li > a.selected').length === 1) {
      return true;
    }
    return false
  }

});
