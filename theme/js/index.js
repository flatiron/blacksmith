$(function() {
  
  var selectingTopicTimer,
  selectingSubtopicTimer,
  selected;

  //
  // When the user's mouse enters a subtopic,
  // assume the intent is to select the subtopic
  //
  $('#toc > ul > li > ul > li').mouseenter(function() {
    clearInterval(selectingTopicTimer);
    clearInterval(selectingSubtopicTimer);
  });


  //
  // When the user's mouse enters a topic,
  // assume the intent is to select a subtopic
  //
  $('#toc > ul > li > a').mouseenter(function() {

    clearTimeout(selectingTopicTimer);
    clearTimeout(selectingSubtopicTimer);

    var topic = this;

    //
    // Don't re-open the same item twice
    //
    if($(topic).hasClass('selected')) {
      // console.log('already selected, dont reopen');
      return;
    }

    //
    // If there is no selected topic, immediately open one
    //
    if(!isTopicSelected()){
      //console.log('no topic, just open it quickly');
      openTopic(topic);
      return false;
    }

    //
    // Instead of immediately opening a new topic,
    // we assume the intent is actuallay to drill into a subtopic, and not a topic
    //
    selectingSubtopicTimer = setTimeout(function() {
      openTopic(topic);
    }, 400);

    return false;
  });
  
  //
  // When the user's mouse leaves the Table of Contents completely,
  // after 400ms, assume the intent is to close the menu
  //
  $('#toc').mouseleave(function() {
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
    if(isTopicSelected()){
      closeTopic();
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

  function isSubtopicSelected() {
    if($('#toc > ul > li > ul > li > a.selected').length === 1) {
      return true;
    }
    return false
  }


});