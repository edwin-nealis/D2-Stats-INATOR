window.onload = function() {
    var manifest = chrome.runtime.getManifest();
    var apiKey = manifest.api_key;
    document.querySelector('#logIn').addEventListener('click', function() {
      

    chrome.identity.launchWebAuthFlow({
        url: "https://www.bungie.net/en/oauth/authorize?client_id=" +manifest.oauth2.client_id+"&response_type=code",
        interactive: true
    }).then(response => {
        var code = response.substring(63);
        console.log(code);
    });

    });
  };