var manifest =chrome.runtime.getManifest();
var apiKey = manifest.api_key;
    let displayDiv = document.getElementById('display');
    chrome.storage.local.get(['token'], function(item) {
        let token = JSON.parse(item['token']);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/", true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let p = document.createElement('p');
            let json = JSON.parse(this.responseText);
            console.log(json);
            p.textContent = "Been playing this game for this fucking long " + json.Response.firstAccess;
            displayDiv.append(p);

        }
    }
    xhr.send();
    });

