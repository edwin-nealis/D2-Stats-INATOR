chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({url: '../views/home.html'});
  });