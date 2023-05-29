var manifest =chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var charId1 = null;
var charId2 = null;
var charId3 = null;
var token = null;
    let displayDiv = document.getElementById('display');
    chrome.storage.local.get(['token'], function(item) {
        token = JSON.parse(item['token']);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/", true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let p = document.createElement('p');
                let json = JSON.parse(this.responseText);
                console.log(json);
                memberShipId = json.Response.membershipId;
                p.textContent = "Been playing this game for this fucking long " + json.Response.firstAccess;
                displayDiv.append(p);
                getUserProfile();
            }
        
        }
        xhr.send();
    });

function getUserProfile() {
    let xhr2 = new XMLHttpRequest();
                xhr2.open("GET", 'https://www.bungie.net/platform/User/GetMembershipsById/' + memberShipId + '/254/', true);
                xhr2.setRequestHeader("X-API-Key", apiKey);
                xhr2.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                        let json = JSON.parse(this.responseText);
                        console.log(json);
                        membershipType = json.Response.destinyMemberships[0].LastSeenDisplayNameType;
                        memberShipId = json.Response.primaryMembershipId;
                        getAccount();
                    }
            
                }
                xhr2.send();
}

function getAccount() {
    let xhr = new XMLHttpRequest();
                    xhr.open("GET", 'https://www.bungie.net/platform/Destiny2/' + membershipType + '/Account/' + memberShipId + '/Stats/', true);
                    xhr.setRequestHeader("X-API-Key", apiKey);
                    xhr.onreadystatechange = function () {
                        if (this.readyState === 4 && this.status === 200) {
                            let json = JSON.parse(this.responseText);
                            let chars = json.Response.characters;
                            if(chars.length === 1) {
                                charId1 = chars[0].characterId;
                            } else if(chars.length === 2) {
                                charId1 = chars[0].characterId;
                                charId2 = chars[1].characterId;
                            } else if (chars.length === 3) {
                                charId1 = chars[0].characterId;
                                charId2 = chars[1].characterId;
                                charId3 = chars[2].characterId;
                            }
                            console.log(json);
                            getActivityIds();
                    }
                    }
                    xhr.send();
}

function getActivityIds() {
    let activities;
                            getActivityHistory(null, charId3, 0)
                            .then(async acts => {
                                activities = acts
                            let lastInSession = 1;
                            let lastDate = new Date(activities[0].period);
                            let gotAllOfSession = false;
                            let i = 1
                            let pages = 0;
                            while(!gotAllOfSession) {
                            for(; i < activities.length; i++) {
                                let thisDate = new Date(activities[i].period);
                                let lastDatePluse2Hours = lastDate.getTime() - 7200000;
                                console.log(thisDate.getTime() + "    " + lastDatePluse2Hours);
                                if(thisDate.getTime() >= lastDatePluse2Hours) {
                                    lastInSession = i;
                                } else {
                                    break;
                                }
                                lastDate = thisDate;
                            }
                            console.log(lastInSession);
                            if(lastInSession === activities.length - 1) {
                                await getActivityHistory(null, charId1, ++pages).then(json => {
                                    activities.concat(json)
                               });
                            } else {
                                gotAllOfSession = true;
                                activities.splice(lastInSession + 1);
                            }
                            }

                            console.log(activities);
                        });
}

function getActivityHistory(mode, charId, page) {
    if(mode === null) {
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

                            console.log(json);
                            resolve(json.Response.activities);
                        } else {
                            reject(this.status);
                        }
                    };
                    xhr.send();
                });
            
}