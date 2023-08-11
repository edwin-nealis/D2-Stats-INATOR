
var manifest = chrome.runtime.getManifest();
var apiKey = manifest.api_key;
var memberShipId = "";
var membershipType;
var chars;
var itemManifest;
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
            console.log(allStats);
        });
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
}

async function updatePage() {
    await getSessionStats(selectedMode, selectedId);
        console.log
        let displayDiv = document.getElementById("top");
        let p2 = document.createElement('p');
        p2.textContent = "Games in Session: " + graphStatsAll.all.sessionSize + "num mercys: " + graphStatsAll.all.mercyCount + " wins: " + graphStatsAll.all.winCount + " loses: " + graphStatsAll.all.loseCount + " ties: " + graphStatsAll.all.tieCount;
        displayDiv.append(p2);
        makePieGraph('enemys',  "enemysChart", "Enemys");
        makePieGraph('teamMates',  "teamMatesChart", "teamMates");
        makePieGraph('player',  "playerChart", "players");
}

/**
 * 
 * @param {String} group  
 * @param {String} chart 
 * @param {String} title 
 */
async function makePieGraph(group, chart, title) {
    let xValues = ["primay", "special", "Heavy", "Grenade", "Melee", "Super", "Other Abilities"];
    var barColors = [
        "#E2E2E2",
        "#5C7A41",
        "#B63ABC",
        "#F7F600",
        "#58C8F2",
        "#ED9CBF",
        "#000000"
    ]
    console.log(graphStatsAll[group].allKills);
    let p = document.createElement('p');
    let p2 = document.createElement('p');
    let p3 = document.createElement('p');
    let p4 = document.createElement('p');
    p.textContent = graphStatsAll[group].quit + " " + title + " did not finish";
    p2.textContent = title + " had " + (graphStatsAll[group].allKills / graphStatsAll.all.sessionSize).toFixed(2) + "Avg. kills per game";
    p3.textContent = "  avg kd" + (graphStatsAll[group].kd / graphStatsAll[group].numPlayers).toFixed(2);
    p4.textContent = "avg account kd " + (graphStatsAll[group].overAllKd / graphStatsAll[group].numPlayers).toFixed(2) + "  avg. acount kda " + (graphStatsAll[group].overAllKda / graphStatsAll[group].numPlayers).toFixed(2);
    let display = document.querySelector('#display');
    display.append(p);
    display.append(p2);
    display.append(p3);
    display.append(p4);
    let yValues = [graphStatsAll[group].primaryKills, graphStatsAll[group].specialKills, graphStatsAll[group].heavyKills, graphStatsAll[group].grenadeKills, graphStatsAll[group].meleeKills, graphStatsAll[group].superKills, graphStatsAll[group].otherAbilities];
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
                    },
                    title: {
                        display: true,
                        text: title,
                        color: '#eceaea'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = yValues[context.dataIndex] + "--" + ((yValues[context.dataIndex] / graphStatsAll[group].allKills) * 100).toFixed(2) + "%";
                                return label;
                            }
                        }
                    },
                }
            }
        });
    }

}

function getManifest() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/Manifest", true);
    xhr.setRequestHeader("X-API-Key", apiKey);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let json = JSON.parse(this.responseText);
            let xhr2 = new XMLHttpRequest();
            xhr2.open("GET", "https://www.bungie.net" + json.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemLiteDefinition);
            xhr2.setRequestHeader("X-API-Key", apiKey);
            xhr2.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let json = JSON.parse(this.responseText);
                    itemManifest = json;
                }
            };
            xhr2.send()
        }

    };
    xhr.send();
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
        let temp = char1Stats.charType
        if (i === 1) {
            temp = char2Stats.charType;
        } else if (i === 2) {
            temp = char3Stats.charType
        }
        if (temp === 0) {
            className = "Titan";
        } else if (temp === 1) {
            className = "Hunter";
        } else if (temp === 2) {
            className = "Warlock";
        }
        button.innerHTML = className; // Find Class Name
        button.setAttribute("id", "button-character" + i);
        button.onclick = function () { toggleButtons(this) };
        document.querySelector('#button-container').appendChild(button);

    }
    document.querySelector('#button-character0').disabled = true;
    let refresh = document.createElement('button');
    refresh.innerHTML = "refresh";
    refresh.onclick = function () { reload() };
    document.querySelector('#button-container').appendChild(refresh);

}

async function toggleButtons(btn) {
    document.querySelectorAll('[id^="button-character"]').forEach(btn => btn.disabled = false);
    btn.disabled = true;
    if (btn.id.slice(-1) == "0") {
        selectedId = char1Stats.charId;
    } else if (btn.id.slice(-1) == "1") {
        selectedId = char2Stats.charId;
    } else if (btn.id.slice(-1) == "2") {
        selectedId = char3Stats.charId;
    }
    await updatePage();
}

function createModeButtons() {
    for (let i = 0; i < 4; i++) {
        let button = document.createElement('button');
        let mode;
        if (i === 0) {
            mode = 'Trials';
        } else if (i === 1) {
            mode = 'Comp';
        } else if (i === 2) {
            mode = 'Iorn Banner';
        } else {
            mode = 'Control';
        }
        button.innerHTML = mode;
        button.setAttribute("id", mode);
        button.classList.add('modeBtn');
        button.onclick = function () { toggleModeButtons(this) };
        document.querySelector('#button-container').appendChild(button);

    }
    let selectedBtnId = "";
    if (selectedMode === TRIALS) {
        selectedBtnId = "#Trials";
    } else if (selectedMode === COMP) {
        selectedBtnId = "#Comp";
    } else if (selectedMode === IORNBANNER) {
        selectedBtnId = "#Iorn Banner";
    } else {
        selectedBtnId = "#Control";
    }
    document.querySelector(selectedBtnId).disabled = true;

}

async function toggleModeButtons(btn) {
    document.querySelectorAll('.modeBtn').forEach(btn => btn.disabled = false);
    btn.disabled = true;
    if (btn.id === 'Trials') {
        selectedMode = TRIALS;
    } else if (btn.id === 'Comp') {
        selectedMode = COMP;
    } else if (btn.id === 'Iorn Banner') {
        selectedMode = IORNBANNER
    } else if (btn.id === 'Control') {
        selectedMode = CONTROL
    }
    await updatePage();
}
//this method does not check the session time cut offs it is a fast reload use case is for when app is open while playing and have just finished a match
async function reload() {
    await getActivityHistory(selectedMode, selectedId, 0).then(async json => {
        console.log(json);
        /**@type {array} */
        let charStats;
        if (selectedId === char1Stats.charId) {
            charStats = char1Stats[selectedMode];
        } else if (selectedId === char2Stats.charId) {
            charStats = char2Stats[selectedMode];
        } else if (selectedId === char3Stats.charId) {
            charStats = char3Stats[selectedMode];
        }
        /**@type {array} */
        let activites = json.Response.activities;
        console.log(activites);
        console.log(charStats);
        let i = 0;
        if (activites.length !== 0) {
            while (charStats[i].period !== activites[i].period) {
                charStats.unshift(activites[i]);
                i++;
            }
        }
        if (i > 0) {
            await updatePage();
        }
    });
}