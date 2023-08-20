
var manifest = chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var chars;
var itemManifest;
var bngDisplayName;
window.onload = function () {
    chrome.storage.local.get(['token'], async function (item) {
        token = JSON.parse(item['token']);
        let userJson;
        await getUser().then(json => {
            userJson = json;
        });
        console.log(userJson);
        memberShipId = userJson.Response.membershipId;
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

    });
}
