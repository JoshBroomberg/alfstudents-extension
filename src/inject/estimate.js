var host = "http://localhost:8000"; 
// var host = "https://alfstudent.herokuapp.com";

function findUrls(text)
{
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    var uniqueUrls = urlArray.filter(function(item, pos) {
        return urlArray.indexOf(item) == pos;
    })

    return uniqueUrls;
}

function sendRating(article_url, rating, rating_div){
  chrome.runtime.sendMessage({
    method: 'GET',
    action: 'xhttp',
    url: host + "/reading/rate",
    data: JSON.stringify({
      "rating": rating,
      "article_url": encodeURIComponent(article_url)
    })
  }, function(responseText) {
      rating_div.text("Rated: " + JSON.parse(responseText).rating);
  });
}

var round = false;
var lessThanAMinute = "Less than a minute";
var totalTime = 0;

function time_string_from_seconds(seconds, additive){
  if(additive){
    totalTime += seconds;
  }
  var time_string = "";

  if (seconds > 0) {
    if(round === true) {

      var readingTimeMinutes = Math.round(seconds / 60);

    //if round is set to false
    } else {

      var readingTimeMinutes = Math.floor(seconds / 60);

    }

    //define remaining reading time seconds
    var readingTimeSeconds = Math.round(seconds - readingTimeMinutes * 60);

    //if round is set to true
    if(round === true) {

      //if minutes are greater than 0
      if(readingTimeMinutes > 0) {

        //set reading time by the minute
        time_string = readingTimeMinutes + ' mins';

      } else {

        //set reading time as less than a minute
        time_string = lessThanAMinute;

      }

    //if round is set to false
    } else {

      //format reading time
      if (readingTimeSeconds < 10) {
        readingTimeSeconds = "0" + readingTimeSeconds
      }

      var time_string = readingTimeMinutes + ':' + readingTimeSeconds;
    }

    return time_string;

  // if seconds are zero
  } else {

    return "unknown";

  }
};

function set_total(time){
  var total_time_str = "(time: " + time_string_from_seconds(totalTime, false) + ")";
  var reading_heading = $( ".description" ).find( "h3" ).each(function(index){
    if (index === 0){
      $(this).text("Readings " + total_time_str);
    }
  });
};

function set_times(){
  $( ".description" ).find( "p" ).each(function(index){
    var urls = findUrls($(this).text());
    if (urls.length > 0 && $(this).find(".time-" + index).length === 0){
      var reading_url = urls[urls.length-1];
      var readingTimeTag = $('<div class="time-'+index+'" id="reading-'+index+'"></div>');
      var videoTimeTag = $('<div class="time-'+index+'" id="video-'+index+'"></div>');

      var ratingTag = $('<div class="rating-'+index+'" data-url="'+ reading_url +'">Rate: <a class="short-rating" id="short-rating-'+index+'" href="#">Too short</a>/<a class="long-rating" id="long-rating-'+index+'" href="#">Too long</a></div>');
      $(this).append(readingTimeTag, videoTimeTag, ratingTag);
      $(this).prepend("<input type='checkbox'></input>");

      chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: host + "/reading/predict",
        data: JSON.stringify({
          "wpm": wordsPerMinute,
          "article_url": encodeURIComponent(reading_url)
        })
      }, function(responseText) {
          response_dict = JSON.parse(responseText);
          if (response_dict.text > 10) {
            $("#reading-" + index).append("Reading time: "); 
            $("#reading-" + index).append(time_string_from_seconds(parseInt(response_dict.text), true));
            set_total();
          }

          if (response_dict.video > 10) {
            $("#video-" + index).append("Video time: "); 
            $("#video-" + index).append(time_string_from_seconds(parseInt(response_dict.video), true));
            set_total();
          }

          if (response_dict.video <= 10 && response_dict.text <= 10) {
            $("#reading-" + index).append("Reading time: unavailable"); 
          }
      });
    }
  });
};

var wordsPerMinute = 300;
chrome.storage.sync.get({
    wpm: '300'
  }, function(items) {
    wordsPerMinute = parseInt(items.wpm);
    set_times();
});

// $(".short-rating").each(function(){$(this).preventDefault()});
// $(".long-rating").each(function(){$(this).preventDefault()});

$(".short-rating").click(function($e){
  var article_url = $(this).parent().attr('data-url');
  sendRating(article_url, 1, $(this).parent());
  return false;
});

$(".long-rating").click(function($e){
  var article_url = $(this).parent().attr('data-url');
  sendRating(article_url, 2, $(this).parent());
  return false;
});