var manifest = chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var charId1 = null;
var charId2 = null;
var charId3 = null;
var token = null;
var session;
window.onload = function () {
    let displayDiv = document.getElementById('display');
    chrome.storage.local.get(['token'], async function (item) {
        token = JSON.parse(item['token']);
        let userJson;
        await getUser().then(json => {
            userJson = json;
        });
        let p = document.createElement('p');
        console.log(userJson);
        memberShipId = userJson.Response.membershipId;
        p.textContent = "Been playing this game for this fucking long " + userJson.Response.firstAccess;
        displayDiv.append(p);
        let profileJson;
        await getUserProfile().then(json => {
            profileJson = json;
        });
        membershipType = profileJson.Response.destinyMemberships[0].LastSeenDisplayNameType;
        memberShipId = profileJson.Response.primaryMembershipId;
        let accountJson;
        await getAccount().then(json => {
            accountJson = json;
        });
        let chars = accountJson.Response.characters;
        if (chars.length === 1) {
            charId1 = chars[0].characterId;
        } else if (chars.length === 2) {
            charId1 = chars[0].characterId;
            charId2 = chars[1].characterId;
        } else if (chars.length === 3) {
            charId1 = chars[0].characterId;
            charId2 = chars[1].characterId;
            charId3 = chars[2].characterId;
        }
        await getActivityIds(null, charId3);
        console.log(session);
    });
}
function getUser() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/", true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else {
                reject(this.status);
            }

        };
        xhr.send();
    });
}
function getUserProfile() {
    return new Promise((resolve, reject) => {
        let xhr2 = new XMLHttpRequest();
        xhr2.open("GET", 'https://www.bungie.net/platform/User/GetMembershipsById/' + memberShipId + '/254/', true);
        xhr2.setRequestHeader("X-API-Key", apiKey);
        xhr2.onreadystatechange = async function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else {
                reject(this.status)
            }

        };
        xhr2.send();
    });
}

function getAccount() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.bungie.net/platform/Destiny2/' + membershipType + '/Account/' + memberShipId + '/Stats/', true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.onreadystatechange = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else {
                reject(this.status);
            }
        };
        xhr.send();
    });
}

async function getActivityIds(mode, character) {
    let activities;
    await getActivityHistory(mode, character, 0)
        .then(async acts => {
            activities = acts.Response.activities
            let lastInSession = 1;
            let lastDate = new Date(activities[0].period);
            let gotAllOfSession = false;
            let i = 1
            let pages = 0;
            while (!gotAllOfSession) {
                for (; i < activities.length; i++) {
                    let thisDate = new Date(activities[i].period);
                    let lastDatePluse2Hours = lastDate.getTime() - 7200000;
                    console.log(thisDate.getTime() + "    " + lastDatePluse2Hours);
                    if (thisDate.getTime() >= lastDatePluse2Hours) {
                        lastInSession = i;
                    } else {
                        break;
                    }
                    lastDate = thisDate;
                }
                console.log(lastInSession);
                if (lastInSession === activities.length - 1) {
                    await getActivityHistory(mode, character, ++pages).then(json => {
                        activities.concat(json.Response.activities)
                    });
                } else {
                    gotAllOfSession = true;
                    activities.splice(lastInSession + 1);
                }
            }
            console.log(activities)

            session = activities;
        });
}

function getActivityHistory(mode, charId, page) {
    if (mode === null) {
        mode = "";
    } else {
        mode = '&mode=' + mode;
    }
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.bungie.net/platform/Destiny2/' + membershipType + '/Account/' + memberShipId + '/Character/' + charId + '/Stats/Activities/?page=' + page + mode, true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else {
                reject(this.status);
            }
        };
        xhr.send();
    });

}