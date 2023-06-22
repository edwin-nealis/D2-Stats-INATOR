



var manifest = chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var charId1 = null;
var charId2 = null;
var charId3 = null;
var token = null;
/** mode id for iorn banner @type {int} */
const IORNBANNER = 19;
/** mode id for trials of osiris @type {int} */
const TRIALS = 84;
/** mode id for the competive game mode @type {int} */
const COMP = 69;
/** mode id for contorol @type {int} */
const CONTROL = 10;
var selectedId;
var selectedMode = CONTROL;
var charClass = new Array(3);
/** Charcter stat object
 *  @typedef {Object} StatsObj
 *  @property {int} charId 
 *  @property {array[Object]} IORNBANNER - iron baner stats
 *  @property {array[Object]} TRIALS - trails stats
 *  @property {array[Object]} COMP - comp stats
 *  @property {array[Object]} CONTROL - control stats
 */
/** @type {StatsObj} */
const char1Stats = {};
/** @type {StatsObj} */
const char2Stats = {};
/** @type {StatsObj} */
const char3Stats = {};
var teamMates = [];
var enemys = [];
var player = [];
var games = [];
var chars;
var mercyCount;
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
        console.log(characterJson);
        chars = accountJson.Response.characters;
        if (chars.length === 1) {
            charId1 = chars[0].characterId;
            charClass[0] = characterJson.Response.characters.data[charId1].classType;
        } else if (chars.length === 2) {
            charId1 = chars[0].characterId;
            charId2 = chars[1].characterId;
            charClass[0] = characterJson.Response.characters.data[charId1].classType;
            charClass[1] = characterJson.Response.characters.data[charId2].classType;
        } else if (chars.length === 3) {
            charId1 = chars[0].characterId;
            charId2 = chars[1].characterId;
            charId3 = chars[2].characterId;
            charClass[0] = characterJson.Response.characters.data[charId1].classType;
            charClass[1] = characterJson.Response.characters.data[charId2].classType;
            charClass[2] = characterJson.Response.characters.data[charId3].classType;
        }


        //character id used in all calls
        selectedId = charId1;
        let promisesActivitiesChar1 = [];
        let promisesActivitiesChar2 = [];
        let promisesActivitiesChar3 = [];
        promisesActivitiesChar1.push(getActivityIds(IORNBANNER, charId1));
        promisesActivitiesChar1.push(getActivityIds(TRIALS, charId1));
        promisesActivitiesChar1.push(getActivityIds(COMP, charId1));
        promisesActivitiesChar1.push(getActivityIds(CONTROL, charId1));

        promisesActivitiesChar2.push(getActivityIds(IORNBANNER, charId2));
        promisesActivitiesChar2.push(getActivityIds(TRIALS, charId2));
        promisesActivitiesChar2.push(getActivityIds(COMP, charId2));
        promisesActivitiesChar2.push(getActivityIds(CONTROL, charId2));

        promisesActivitiesChar3.push(getActivityIds(IORNBANNER, charId3));
        promisesActivitiesChar3.push(getActivityIds(TRIALS, charId3));
        promisesActivitiesChar3.push(getActivityIds(COMP, charId3));
        promisesActivitiesChar3.push(getActivityIds(CONTROL, charId3));

        let activites = await Promise.all(promisesActivitiesChar1);
        activites.forEach(json => {
            char1Stats.charId = charId1;
            let curentModes = json[0].activityDetails.modes;
            if (curentModes.includes(IORNBANNER)) {
                char1Stats[IORNBANNER] = json;
            } else if (curentModes.includes(COMP)) {
                char1Stats[COMP] = json;
            } else if (curentModes.includes(CONTROL)) {
                char1Stats[CONTROL] = json;
            } else {
                char1Stats[TRIALS] = json;
            }

        });
        activites = await Promise.all(promisesActivitiesChar2);
        activites.forEach(json => {
            char2Stats.charId = charId2;
            let curentModes = json[0].activityDetails.modes;
            if (curentModes.includes(IORNBANNER)) {
                char2Stats[IORNBANNER] = json;
            } else if (curentModes.includes(COMP)) {
                char2Stats[COMP] = json;
            } else if (curentModes.includes(CONTROL)) {
                char2Stats[CONTROL] = json;
            } else {
                char2Stats[TRIALS] = json;
            }

        });
        activites = await Promise.all(promisesActivitiesChar3);
        activites.forEach(json => {
            char3Stats.charId = charId3;
            let curentModes = json[0].activityDetails.modes;
            if (curentModes.includes(IORNBANNER)) {
                char3Stats[IORNBANNER] = json;
            } else if (curentModes.includes(COMP)) {
                char3Stats[COMP] = json;
            } else if (curentModes.includes(CONTROL)) {
                char3Stats[CONTROL] = json;
            } else {
                char3Stats[TRIALS] = json;
            }

        });

        console.log(char1Stats);
        console.log(char2Stats);
        console.log(char3Stats);
        // await getActivityIds(selectedMode, selectedId).then(json => {
        //     session = json;
        // });

        // console.log(session);
        let buttonContainer = document.createElement('div');
        buttonContainer.setAttribute("id", "button-container");
        let div = document.querySelector('#top');
        div.append(buttonContainer);
        createCharacterButtons(chars.length);
        createModeButtons();
        getSessionStats(selectedMode, selectedId);

    });
}
/**
 * gets stats for the current session and displys to screen 
 * @param {int} mode
 * @param {int} charId
 */
async function getSessionStats(mode, charId) {
    let session;
    let winCount = 0;
    let loseCount = 0;
    let tieCount = 0;
    mercyCount = 0;
    let displayDiv = document.getElementById('session');
    let statsDiv = document.getElementById('display');
    displayDiv.innerHTML = "";
    statsDiv.innerHTML = "";
    if (char1Stats.charId === charId) {
        session = char1Stats[mode];
    } else if (char2Stats.charId === charId) {
        session = char2Stats[mode];
    } else {
        session = char3Stats[mode];
    }
    console.log(session);
    games = new Array();

    for (let i = 0; i < session.length; i++) {
        if (session[i].values.completionReason.basic.value === 4) {
            mercyCount++;
        }
        await getPostGameReport(session[i].activityDetails.instanceId).then(json => {
            games[i] = json;
        });

    }
    console.log(games);
    teamMates = new Array();
    enemys = new Array();
    player = new Array();

    for (let i = 0; i < games.length; i++) {

        let team1 = new Array();
        let team2 = new Array();
        let team1Name = games[i].Response.teams[0].teamId;
        let isPlayerTeam1 = null;
        for (let ii = 0; ii < games[i].Response.entries.length; ii++) {
            if (games[i].Response.entries[ii].values.team.basic.value === team1Name) {
                if (games[i].Response.entries[ii].characterId === charId) {
                    if (games[i].Response.entries[ii].standing === 0) {
                        winCount++;
                    } else if (games[i].Response.entries[ii].standing === 1) {
                        loseCount++;
                    } else {
                        tieCount++;
                    }
                    player.push(games[i].Response.entries[ii]);
                    isPlayerTeam1 = true;
                } else {
                    team1.push(games[i].Response.entries[ii]);
                }
            } else {
                if (games[i].Response.entries[ii].characterId === charId) {
                    if (games[i].Response.entries[ii].standing === 0) {
                        winCount++;
                    } else if (games[i].Response.entries[ii].standing === 1) {
                        loseCount++;
                    } else {
                        tieCount++;
                    }
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
    p2.textContent = "Games in Session: " + session.length + "num mercys: " + mercyCount + " wins: " + winCount + " loses: " + loseCount + " ties: " + tieCount;
    displayDiv.append(p2);
    makePieGraph(enemys, session.length, "enemysChart", "Enemys", mode);
    makePieGraph(teamMates, session.length, "teamMatesChart", "teamMates", mode);
    makePieGraph(player, session.length, "playerChart", "players", mode);
}
async function makePieGraph(players, games, chart, title, mode) {
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
    let kd = 0;
    let kda = 0;
    let overAllKd = 0;
    let overAllKda = 0;
    let itemTypeDisplayName = [];
    let promises = [];
    let quit = 0;
    var barColors = [
        "#E2E2E2",
        "#5C7A41",
        "#B63ABC",
        "#F7F600",
        "#58C8F2",
        "#ED9CBF",
        "#000000"
    ]
    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            promises.push(getKd(players[i].characterId, players[i].player.destinyUserInfo.membershipId, players[i].player.destinyUserInfo.membershipType, mode));
            for (let j = 0; j < players[i].extended.weapons.length; j++) {
                promises.push(getItem(players[i].extended.weapons[j].referenceId, players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value));
            }
        }
    }
    let data = await Promise.all(promises);
    data.forEach(weapon => {
        if (weapon.Response.hasOwnProperty('equippingBlock')) {
            if (weapon.Response.equippingBlock.ammoType === 1) {
                primaryKills += weapon.kills;
            } else if (weapon.Response.equippingBlock.ammoType === 2) {
                specialKills += weapon.kills;
            } else if (weapon.Response.equippingBlock.ammoType === 3) {
                heavyKills += weapon.kills;
            }
            itemTypeDisplayName.push(weapon.Response.itemTypeDisplayName);
        } else {
            overAllKd += weapon.Response[Object.keys(weapon.Response)[0]].allTime.killsDeathsRatio.basic.value;
            overAllKda += weapon.Response[Object.keys(weapon.Response)[0]].allTime.killsDeathsAssists.basic.value;
        }
    });

    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            allKills += players[i].values.kills.basic.value;
            grenadeKills += players[i].extended.values.weaponKillsGrenade.basic.value;
            meleeKills += players[i].extended.values.weaponKillsMelee.basic.value;
            superKills += players[i].extended.values.weaponKillsSuper.basic.value;
            otherAbilities += players[i].extended.values.weaponKillsAbility.basic.value;
            kd += players[i].values.killsDeathsRatio.basic.value;
            kda += players[i].values.killsDeathsAssists.basic.value;
            if (players[i].values.completed.basic.value === 0) {
                quit++;
            }
            for (let j = 0; j < players[i].extended.weapons.length; j++) {
                weaponKills += players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value;
            }
        }
    }

    let p = document.createElement('p');
    let p2 = document.createElement('p');
    let p3 = document.createElement('p');
    let p4 = document.createElement('p');
    p.textContent = quit + " " + title + " did not finish";
    p2.textContent = title + " had " + (allKills / games).toFixed(2) + "Avg. kills per game";
    p3.textContent = "  avg kd" + (kd / players.length).toFixed(2) + "  avg kda" + (kda / players.length).toFixed(2);
    p4.textContent = "avg account kd " + (overAllKd / players.length).toFixed(2) + "  avg. acount kda " + (overAllKda / players.length).toFixed(2);
    let display = document.querySelector('#display');
    display.append(p);
    display.append(p2);
    display.append(p3);
    display.append(p4);
    let yValues = [primaryKills, specialKills, heavyKills, grenadeKills, meleeKills, superKills, otherAbilities]
    let oldChart = Chart.getChart(chart);
    if (oldChart !== undefined) {
        console.log(oldChart);
        oldChart.data.datasets[0].data = yValues;
        oldChart.update();
    } else {
        new Chart(chart, {
            type: "pie",
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues,
                    title: xValues,
                    borderColor: '#555555'
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#eceaea',
                        }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    color: '#eceaea'
                },
                tooltips: {
                    backgroundColor: '#aba5a5f3',
                    titleFontColor: '#eceaea',
                    bodyFontColor: '#eceaea',
                    bodySpacing: 4,
                    xPadding: 12,
                    mode: "nearest",
                    intersect: 0,
                    position: "nearest",
                    // callbacks: {
                    //     label: function(context) {
                    //         let label = xValues[context.datasetIndex] + " " + ((context.y/ allKills) * 100).toFixed(0) + "%";
                    //         return label; 
                    //     }
                    // }
                },
            }
        });
    }

}
function getKd(charId, memId, memTypes, mode) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/" + memTypes + "/Account/" + memId + "/Character/" + charId + "/Stats/?modes=" + mode, true);
        xhr.setRequestHeader("X-API-Key", apiKey);

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if (this.readyState === 4) {
                reject(this.status);
            }

        };
        xhr.send();
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
            } else if (this.readyState === 4) {
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
            } else if (this.readyState === 4) {
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
            } else if (this.readyState === 4) {
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
            } else if (this.readyState === 4) {
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
            } else if (this.readyState === 4) {
                reject(this.status);
            }
        };
        xhr.send();
    });
}
//this always returns 2 matches even if the secound match is outside the time threshold 
async function getActivityIds(mode, character) {
    return new Promise(async (resolve, reject) => {
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
                if (activities === 'unefined') {
                    reject();
                } else {
                    resolve(activities);
                }

            });
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
            } else if (this.readyState === 4) {
                reject(this.status);
            }
        };
        xhr.send();
    });

}

function getCharacter() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.bungie.net/platform/Destiny2/' + membershipType + '/Profile/' + memberShipId + '/?components=200', true);
        xhr.setRequestHeader("X-API-Key", apiKey);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                resolve(json);
            } else if (this.readyState === 4) {
                reject(this.status);
            }
        };
        xhr.send();
    });
}


function createCharacterButtons(characterNum) {
    for (let i = 0; i < characterNum; i++) {
        let button = document.createElement('button');
        let className = "";
        if (charClass[i] == 0) {
            className = "Titan";
        } else if (charClass[i] == 1) {
            className = "Hunter";
        } else if (charClass[i] == 2) {
            className = "Warlock";
        }
        button.innerHTML = className; // Find Class Name
        button.setAttribute("id", "button-character" + i);
        button.onclick = function () { toggleButtons(this) };
        document.querySelector('#button-container').appendChild(button);

    }
    let refresh = document.createElement('button');
    refresh.innerHTML = "refresh";
    refresh.onclick = function () { reload() };
    document.querySelector('#button-container').appendChild(refresh);

}

function toggleButtons(btn) {
    document.querySelectorAll('[id^="button-character"]').forEach(btn => btn.disabled = false);
    btn.disabled = true;
    if (btn.id.slice(-1) == "0") {
        selectedId = charId1;
        console.log(charId1);
    } else if (btn.id.slice(-1) == "1") {
        selectedId = charId2;
        console.log(charId2);
    } else if (btn.id.slice(-1) == "2") {
        selectedId = charId3;
        console.log(charId3);
    }
    getSessionStats(selectedMode, selectedId);
}

function createModeButtons() {
    for (let i = 0; i < 4; i++) {
        let button = document.createElement('button');
        let mode;
        if (i === 0) {
            mode = 'Trials';
        } else if(i === 1) {
            mode = 'Comp';
        } else if (i === 2) {
            mode = 'Iorn Banner';
        } else {
            mode = 'Control';
        }
        button.innerHTML = mode; 
        button.setAttribute("id", mode);
        button.onclick = function () { toggleModeButtons(this) };
        document.querySelector('#button-container').appendChild(button);

    }

}

function toggleModeButtons(btn) {
    document.querySelectorAll('[id^="button-character"]').forEach(btn => btn.disabled = false);
    btn.disabled = true;
    if (btn.id === 'Trials') {
        selectedMode = IORNBANNER;
    } else if (btn.id === 'Comp') {
        selectedMode = COMP;
    } else if (btn.id === 'Iorn Banner') {
        selectedMode = IORNBANNER
    } else if (btn.id === 'Control') {
        selectedMode = CONTROL
    }
    getSessionStats(selectedMode, selectedId);
}
//this method does not check the session time cut offs it is a fast reload use case is for when app is onpen while playing and have just finished a match
async function reload() {
    await getActivityHistory(selectedMode, selectedId, 0).then(json => {
        console.log(json);
        /**@type {array} */
        let charStats;
        if (selectedId === char1Stats.charId) {
            charStats = char1Stats[selectedMode];
        } else if (selectedId === char2Stats.charId) {
            charStats = char2Stats[selectedMode];
        } else {
            charStats = char3Stats[selectedMode];
        }
        let activites = json.Response.activites;
        let i = 0;
        while(!charStats.includes(activites[i])) {
            charStats.unshift(activites[i]);
            i++;
        }
        if (i > 0) {
            getSessionStats(selectedMode, selectedId);
        }
    });
}