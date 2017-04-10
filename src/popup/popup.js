// Saves options to chrome.storage
function save_options() {
  var wpm = document.getElementById('wordspermin').value;
  var hideTopbar = document.getElementById('hidetopbar').checked;

  chrome.storage.sync.set({
    wpm: wpm,
    hidetopbar: hideTopbar
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Saved!';
    
    var query = { active: true, currentWindow: true };
    
    function callback(tabs) {
      var currentTab = tabs[0];
      // chrome.runtime.sendMessage({
      //   action: 'reload',
      //   tab: currentTab
      // }, function() {});

      chrome.runtime.sendMessage({
        action: 'updatesettings'
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
    wpm: '300',
    hidetopbar: false
  }, function(items) {
    document.getElementById('wordspermin').value = items.wpm;
    document.getElementById('hidetopbar').checked = items.hidetopbar;
  });
}

function run(){
  chrome.runtime.sendMessage({
    action: 'estimate'
  }, function() {});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

document.getElementById('estimate').addEventListener('click', run);