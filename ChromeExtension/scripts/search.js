

var json;
var maifest = chrome.runtime.getManifest();
var apiKey = maifest.api_key;
var memberShipId;
var membershipType;
var bngDisplayName;
var userName;
function displayHome(home) {
    let kd = document.createElement('p');
    kd.setAttribute('class', 'api');
    kd.textContent = "PvP kill death ratio: " + json.Response.mergedAllCharacters.results.allPvP.allTime.killsDeathsRatio.basic.displayValue;
    home.appendChild(kd);
}
function clear() {
    document.getElementById("display").innerHTML = "";
}
document.getElementById("submit").addEventListener('click', async function () {
    clear();
    document.getElementById("submit").classList.toggle('noDisplay');
    document.getElementById("load").classList.toggle('noDisplay');
    let name = document.getElementById("bngId").value;
    let searchJson;
    await searchName(name).then(json => {
        searchJson = json;
    });
    console.log(searchJson)

    userName = searchJson.Response.searchResults[0].bungieGlobalDisplayName;
    memberShipId = searchJson.Response.searchResults[0].bungieNetMembershipId;
    let profileJson;
    await getUserProfile().then(json => {
        profileJson = json;
    });
    console.log(profileJson)
    bngDisplayName = profileJson.Response.bungieNetUser.cachedBungieGlobalDisplayName;
    membershipType = profileJson.Response.destinyMemberships[0].LastSeenDisplayNameType;
    memberShipId = profileJson.Response.primaryMembershipId;
    let accountJson;
    await getAccount().then(json => {
        accountJson = json;
    });
    let characterJson;
    await getCharacter().then(json => {
        characterJson = json;
    });
    console.log(accountJson);
    console.log(characterJson);
    getManifest();
    await getCharacterStats(characterJson, accountJson.Response.characters).then(stats => {
        chars = accountJson.Response.characters;
        let buttonContainer = document.createElement('div');
        buttonContainer.setAttribute("id", "button-container");
        let div = document.querySelector('#top');
        div.append(buttonContainer);
        createCharacterButtons(chars.length);
        createModeButtons();
        console.log(allStats)
        selectedId = char1Stats.charId;
        updatePage();
    });
    document.getElementById("submit").classList.toggle('noDisplay');
    document.getElementById("load").classList.toggle('noDisplay');

}, { capture: true });




function searchName(name) {
    let xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        xhr.open("POST", "https://www.bungie.net/platform/User/Search/GlobalName/0/", true);
        xhr.setRequestHeader("X-API-Key", apiKey);

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if (this.readyState === 4) {
                reject(this.status);
            }

        }
        xhr.send('{ "displayNamePrefix": "' + name + '" }');
    });
}

