// Script Injection
function injectScript(file) {
  chrome.tabs.executeScript({
    file: 'js/jquery/jquery.js'
  }, function() {
      chrome.tabs.executeScript({"file": ("src/inject/" + file)});
  });
};

function runEstimates(){
  injectScript("estimate.js");
};

function runVisualModifications(){
  injectScript("modify_visuals.js");
};

function isClassURL(url){
  var classURLMatcher = "https:\/\/seminar\.minerva\.kgi\.edu\/app\/courses\/[0-9]{1,}\/sections\/[0-9]{1,}\/classes\/[0-9]{1,}"
  return url.match(classURLMatcher);
};

function isALFSessionURL(url){
  var ALFSessionURLMatcher = "https:\/\/seminar\.minerva\.kgi\.edu\/app\/classes\/[0-9]{1,}"
  return url.match(ALFSessionURLMatcher);
};

chrome.tabs.onUpdated.addListener(function(id, info, tab){
  if (isClassURL(tab.url)) {
    runEstimates();
  } else if (isALFSessionURL(tab.url)){
    runVisualModifications();
  }
});

chrome.webNavigation.onTabReplaced.addListener(function (details) {
  runEstimates();
});

// Setting
var modify_topbar = false;

function updateSettings() {
  chrome.storage.sync.get({
    hidetopbar: false
  }, function(items){
    modify_topbar = items.hidetopbar;
  });
};

updateSettings();


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == "xhttp") {
      var xhttp = new XMLHttpRequest();
      var method = request.method ? request.method.toUpperCase() : 'GET';

      xhttp.onload = function() {
          callback(xhttp.responseText);
      };
      xhttp.onerror = function() {
          // Error code.
      };
      xhttp.open(method, request.url, true);
      if (method == 'POST') {
          xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      xhttp.send(request.data);
      return true;
  }

  if (request.action == "reload") {
    chrome.tabs.reload(request.tab.id);
    setTimeout(function() {
      runEstimates();
    }, 6000);
  }

  if (request.action == "estimate") {
    runEstimates();
  }

  if (request.action == "modifytopbar") {
    callback({hide_desired: modify_topbar});
    return true;
  }

  if (request.action == "updatesettings") {
    updateSettings();
  }
});

 