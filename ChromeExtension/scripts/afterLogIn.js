
var manifest = chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var charId1 = null;
var charId2 = null;
var charId3 = null;
var selectedId;
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
        //character id used in all calls
        selectedId = charId3;
        await getActivityIds(5, selectedId);
        console.log(session);
        var games = [];

        for (let i = 0; i < session.length; i++) {
            await getPostGameReport(session[i].activityDetails.instanceId).then(json => {
                games[i] = json;
            });

        }
        console.log(games);
        let teamMates = [];
        let enemys = [];
        let player = [];

        for (let i = 0; i < games.length; i++) {
            let team1 = new Array();
            let team2 = new Array();
            let team1Name = games[i].Response.teams[0].teamId;
            let isPlayerTeam1 = null;
            for (let ii = 0; ii < games[i].Response.entries.length; ii++) {
                if (games[i].Response.entries[ii].values.team.basic.value === team1Name) {
                    if (games[i].Response.entries[ii].characterId === selectedId) {
                        player.push(games[i].Response.entries[ii]);
                        isPlayerTeam1 = true;
                    } else {
                        team1.push(games[i].Response.entries[ii]);
                    }
                } else {
                    if (games[i].Response.entries[ii].characterId === selectedId) {
                        player.push(games[i].Response.entries[ii]);
                        isPlayerTeam1 = false;
                    } else {
                        team2.push(games[i].Response.entries[ii]);
                    }
                }
            }
            if (i === 0) {
                if (isPlayerTeam1) {
                    teamMates = team1;
                    enemys = team2;
                } else {
                    teamMates = team2;
                    enemys = team1;
                }
            } else {
                if (isPlayerTeam1) {
                    teamMates = teamMates.concat(team1);
                    enemys = enemys.concat(team2);
                } else {
                    teamMates = teamMates.concat(team2);
                    enemys = enemys.concat(team1);
                }
            }

        }
        let p2 = document.createElement('p');
        p2.textContent = "Games in Session: " + session.length;
        displayDiv.append(p2);
        makePieGraph(enemys, "enemysChart", "Enemys");
        makePieGraph(teamMates, "teamMatesChart", "teamMates");
        makePieGraph(player, "playerChart", "players");

    });
}

async function makePieGraph(players, chart, title) {
    let xValues = ["primay", "special", "Heavy", "Grenade", "Melee", "Super", "Other Abilities"];
    let allKills = 0;
    let weaponKills = 0;
    let grenadeKills = 0;
    let meleeKills = 0;
    let superKills = 0;
    let primaryKills = 0;
    let specialKills = 0;
    let heavyKills = 0;
    let otherAbilities = 0;
    let itemTypeDisplayName = [];
    let promises = [];
    let quit = 0;
    var barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#000000",
        "#973273"
    ]
    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            for (let j = 0; j < players[i].extended.weapons.length; j++) {
                promises.push(getItem(players[i].extended.weapons[j].referenceId, players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value));
            }
        }
    }
    let data = await Promise.all(promises);
    data.forEach(weapon => {
        if (weapon.Response.equippingBlock.ammoType === 1) {
            primaryKills += weapon.kills;
        } else if (weapon.Response.equippingBlock.ammoType === 2) {
            specialKills += weapon.kills;
        } else if (weapon.Response.equippingBlock.ammoType === 3) {
            heavyKills += weapon.kills;
        }
        itemTypeDisplayName.push(weapon.Response.itemTypeDisplayName);
    });

    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            allKills += players[i].values.kills.basic.value;
            grenadeKills += players[i].extended.values.weaponKillsGrenade.basic.value;
            meleeKills += players[i].extended.values.weaponKillsMelee.basic.value;
            superKills += players[i].extended.values.weaponKillsSuper.basic.value;
            otherAbilities += players[i].extended.values.weaponKillsAbility.basic.value;
            if (players[i].values.completed.basic.value === 0) {
                quit++;
            }
            for (let j = 0; j < players[i].extended.weapons.length; j++) {
                weaponKills += players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value;
            }
        }
    }
    let p = document.createElement('p');
    p.textContent = quit + " " + title + "did not finish";
    let display = document.querySelector('#display');
    display.append(p);
    let yValues = [primaryKills / allKills, specialKills / allKills, heavyKills / allKills, grenadeKills / allKills, meleeKills / allKills, superKills / allKills, otherAbilities / allKills]

    new Chart(chart, {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
            }
        }
    });

}
//ammoType 1=primary 2=special 3=heavy 4=relic(maybe)
function getItem(id, kills) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + id, true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                json.kills = kills;
                resolve(json);
            } else if(this.readyState === 4) {
                reject(this.status);
            }

        };
        xhr.send();
    });
}
function getPostGameReport(activityId) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/" + activityId + '?definitions=true', true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if(this.readyState === 4) {
                reject(this.status);
            }

        };
        xhr.send();
    });
}
function getUser() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/", true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if(this.readyState === 4) {
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
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if(this.readyState === 4) {
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
                if (this.readyState === 4 && this.status === 200) {
                    let json = JSON.parse(this.responseText);
                    resolve(json);
                } else if(this.readyState === 4) {
                    reject(this.status);
                }
        };
        xhr.send();
    });
}
//this always returns 2 matches even if the secound match is outside the time threshold 
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
                if (this.readyState === 4 && this.status === 200) {
                    let json = JSON.parse(this.responseText);
                    resolve(json);
                } else if(this.readyState === 4) {
                    reject(this.status);
                    console.log("regected");
                }
        };
        xhr.send();
    });

}