var controlKeyCode = 17;

var keysPressed = {};
var shiftKeyCode = 16;
var eightKeyCode = 56;

var topbarHidden = false;

function hideTopbar(){
  $(".participating-users").css("display", "none");
};

function showTopbar() {
  $(".participating-users").css("display", "unset");
};

$(document).keydown(function(e){
  if (e.keyCode === controlKeyCode) {
    chrome.runtime.sendMessage({
      action: 'modifytopbar'
    }, function(response) {
      if (response.hide_desired) {
        hideTopbar();
      }
    });
  }

  keysPressed[e.keyCode] = true;
});

$(document).keyup(function(e){
  if (e.keyCode === controlKeyCode) {
    chrome.runtime.sendMessage({
      action: 'modifytopbar'
    }, function(response) {
      if (response.hide_desired && !topbarHidden) {
        showTopbar();
      }
    });
  }

  if (keysPressed[shiftKeyCode] && e.keyCode === eightKeyCode) {
    if (topbarHidden) {
      showTopbar();
    } else {
      hideTopbar();
    }
    topbarHidden = !topbarHidden;
    keysPressed[eightKeyCode] = false;
  } 

  keysPressed[e.keyCode] = false;
});

