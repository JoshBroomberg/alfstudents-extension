function runEstimates(){
  chrome.tabs.executeScript({
    file: 'js/jquery/jquery.js'
  }, function() {
      chrome.tabs.executeScript({"file": "src/inject/inject.js"});
  });
};

chrome.tabs.onUpdated.addListener(function(id, info, tab){
  runEstimates();
});

chrome.webNavigation.onTabReplaced.addListener(function (details) {
  runEstimates();
});

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == "xhttp") {
      var xhttp = new XMLHttpRequest();
      var method = request.method ? request.method.toUpperCase() : 'GET';

      xhttp.onload = function() {
          callback(xhttp.responseText);
      };
      xhttp.onerror = function() {
          // Do whatever you want on error. Don't forget to invoke the
          // callback to clean up the communication port.
          callback();
      };
      xhttp.open(method, request.url, true);
      if (method == 'POST') {
          xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      xhttp.send(request.data);
      return true; // prevents the callback from being called too early on return
  }

  if (request.action == "reload") {
    chrome.tabs.reload(request.tab.id);
    setTimeout(function() {
      runEstimates();
    }, 6000);
  }
});

 