window.onload = function() {

    chrome.storage.local.remove(['token'], function() {
    var manifest = chrome.runtime.getManifest();
    var apiKey = manifest.api_key;
    document.querySelector('#logIn').addEventListener('click', function() {

    chrome.identity.launchWebAuthFlow({
        url: "https://www.bungie.net/en/oauth/authorize?client_id=" +manifest.oauth2.client_id+"&response_type=code",
        interactive: true
    }).then(response => {
        console.log(response);
        var code = response.substring(63);
        console.log(code)
            fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                "X-API-Key": apiKey,
                //'Authorization': `Basic  ${window.btoa(manifest.oauth2.client_id + ':' + manifest.oauth2.client_secret)}`
              },
              body: new URLSearchParams({
                'client_id': manifest.oauth2.client_id,
                'grant_type': "authorization_code",
                'code': code
              }).toString()
            }).then(function(response) {
                response.json().then(obj => {
                let json = {};
                json['token'] = JSON.stringify(obj.access_token);
                console.log(obj.access_token);
                chrome.storage.local.set(json, function() {
                    window.location.href = "afterLogIn.html";
                   //this saves the access token to local storage should proably be deleted at some point after api call 
                });
              });
            });
    });

    });
});
  };