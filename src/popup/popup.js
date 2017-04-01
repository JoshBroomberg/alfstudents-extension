// Saves options to chrome.storage
function save_options() {
  var wpm = document.getElementById('wordspermin').value;
  chrome.storage.sync.set({
    wpm: wpm
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Saved!';
    
    var query = { active: true, currentWindow: true };
    function callback(tabs) {
      var currentTab = tabs[0]; // there will be only one in this array
      console.log(currentTab); // also has properties like currentTab.id
      chrome.runtime.sendMessage({
        action: 'reload',
        tab: currentTab
      }, function() {});
    }
    chrome.tabs.query(query, callback);

    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    wpm: '300'
  }, function(items) {
    document.getElementById('wordspermin').value = items.wpm;
  });
}

function run(){
  chrome.tabs.executeScript({
      file: 'js/jquery/jquery.js'
  }, function() {
      chrome.tabs.executeScript(null, {"file": "src/inject/inject.js"});
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

document.getElementById('estimate').addEventListener('click',run);