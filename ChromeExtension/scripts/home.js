var apiKey = "c89e72284bc84b759fb941779ae84a3f";
var json;
function displayHome(home) {
    let kd = document.createElement('p');
    kd.setAttribute('class', 'api');
    kd.textContent = "PvP kill death ratio: " + json.Response.mergedAllCharacters.results.allPvP.allTime.killsDeathsRatio.basic.displayValue;
    home.appendChild(kd);
}
//delets all HTML inside of the display div
function clear() {
    document.getElementById("display").innerHTML = "";
}

// document.getElementById("logIn").addEventListener('click', function() {
//     chrome.identity.getAuthToken({interactive: true}, function(token) {
//         let init = {
//             method: 'GET',
//             async: true,
//             headers: {
//                 Authrization: 'Bearer ' + token,
//                 'Content-Type': 'application/json'
//             },
//             'contentType': 'json'
//         };
//         fetch(
//             'https://www.bungie.net/en/OAuth/Authorize?client_id=41255&response_type=code', init)
//             .then((response) => response.json())
//             .then(function(data) {
//                 console.log(data)
//             });
//     });
// });


document.getElementById("submit").addEventListener('click', function () {
    clear();
    document.getElementById("submit").classList.toggle('noDisplay');
    document.getElementById("load").classList.toggle('noDisplay');
    var xhr = new XMLHttpRequest();
    let name = document.getElementById("bngId").value;
    xhr.open("POST", "https://www.bungie.net/platform/User/Search/GlobalName/0/", true);
    xhr.setRequestHeader("X-API-Key", apiKey);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let json1 = JSON.parse(this.responseText);
            console.log(json1);
            var xhr2 = new XMLHttpRequest();
            var bngId = json1.Response.searchResults[0].bungieNetMembershipId;
            xhr2.open("GET", 'https://www.bungie.net/platform/User/GetMembershipsById/' + bngId + '/254/', true);
            xhr2.setRequestHeader("X-API-Key", apiKey);
            xhr2.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let json2 = JSON.parse(this.responseText);
                    console.log(json2);
                    var xhr3 = new XMLHttpRequest();
                    let membershipType = json2.Response.destinyMemberships[0].LastSeenDisplayNameType;
                    bngId = json2.Response.primaryMembershipId;
                    xhr3.open("GET", 'https://www.bungie.net/platform/Destiny2/' + membershipType + '/Account/' + bngId + '/Stats/', true);
                    xhr3.setRequestHeader("X-API-Key", apiKey);
                    xhr3.onreadystatechange = function () {
                        if (this.readyState === 4 && this.status === 200) {
                            json = JSON.parse(this.responseText);
                            console.log(json);
                            let home = document.getElementById("display");
                            if (home !== null) { // display info for home page
                                displayHome(home);
                                document.getElementById("load").classList.toggle('noDisplay');
                                document.getElementById("submit").classList.toggle('noDisplay');
                            }
                        }
                    }
                    xhr3.send();
                }
            }
            xhr2.send();
        }
    }

    xhr.send('{ "displayNamePrefix": "' + name + '" }');
}, { capture: true });