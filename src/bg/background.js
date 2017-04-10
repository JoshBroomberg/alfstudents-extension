var modify_topbar = false;
var current_tab = null;

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
  current_tab = tab.url;
  if (isClassURL(tab.url)) {
    runEstimates();
  } else if (isALFSessionURL(tab.url)){
    runVisualModifications();
  }
});

chrome.webNavigation.onTabReplaced.addListener(function (details) {
  runEstimates();
});

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
      var request_url = request.url;
      
      if (request.data) {
        var param_data = JSON.parse(request.data);
        request_url = request_url + "?";
        
        for (var query_param in param_data) {
          request_url = request_url + (query_param + "=" + param_data[query_param]) + "&";
        }
        request_url = request_url + "src_url=" + encodeURIComponent(current_tab);
      }

      xhttp.onload = function() {
          callback(xhttp.responseText);
      };
      xhttp.onerror = function() {
          console.log("HTTP Error occured");
      };

      xhttp.open(method, request_url, true);
      xhttp.send();
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

 