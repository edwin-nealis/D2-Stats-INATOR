/**
* @typedef {Object} graphStatsObj
* @property {int} allKills - total number of kills
* @property {int} weaponKills - num kills with all weapons combined
* @property {int} grenadeKills - num kills with grenades
* @property {int} meleeKills - num kills with melees
* @property {int} superKills - num kills with super
* @property {int} primaryKills - num kills with primary ammo weapons
* @property {int} specialKills - num kills with special weapons
* @property {int} heavyKills - num kills with heavy weapons
* @property {int} otherAbilities - kills with other abilities (unsure what other counts as other ability)
* @property {int} kd - avg kd for session
* @property {int} kda - avg kda for session
* @property {int} overAllKd - avg kd for account
* @property {int} overAllKda - avg kda for account
* @property {int} quit - number of players that left a game early
* @property {int} numPlayers - number of players in the group i.e. 30 enemys 20 teamMates, the user 10 times
* @property {array[String]} itemTypeDisplayName;
*/
/** Charcter stat object
*  @typedef {Object} StatsObj
*  @property {int} charId 
*  @property {int} charType - 0 for titan, 1 for hunter, 2 for warlock
*  @property {array[Object]} IORNBANNER - iron baner stats
*  @property {array[Object]} TRIALS - trails stats
*  @property {array[Object]} COMP - comp stats
*  @property {array[Object]} CONTROL - control stats
*/
/**
* @typedef {Object} graphStatsGeneralObj
* @property {int} mercyCount - number of games that ended in a mercy
* @property {int} winCount - number of games the users team won
* @property {int} loseCount - numer of games the users team lost
* @property {int} tieCount - number of games that ended in a tie (ties are very rare in Destiny 2)
* @property {number} sessionSize - number of games in the session
*/
/** 
* @typedef graphStats 
* @property {graphStatsObj} player - users stats
* @property {graphStatsObj} enemys - players on oposing teams stats
* @property {graphStatsObj} teamMates - players on same team stats
* @property {graphStatsGeneralObj} all - stats that apply to all players
*/

/** mode id for iorn banner @type {int} */
const IORNBANNER = 19;
/** mode id for trials of osiris @type {int} */
const TRIALS = 84;
/** mode id for the competive game mode @type {int} */
const COMP = 69;
/** mode id for contorol @type {int} */
const CONTROL = 10;

/** @type {StatsObj} */
const char1Stats = {};

/** @type {StatsObj} */
const char2Stats = {};

/** @type {StatsObj} */
const char3Stats = {};

const allStats = [char1Stats, char2Stats, char3Stats];
/**@type {graphStatsGeneralObj} */
const all = {}
/**@type {graphStatsObj} */
const graphStatsPlayer = {};

/**@type {graphStatsObj} */
const graphStatsEnemys = {};

/**@type {graphStatsObj} */
const graphStatsTeamMates = {};

/**@type {graphStats} */
const graphStatsAll = { all: all, enemys: graphStatsEnemys, player: graphStatsPlayer, teamMates: graphStatsTeamMates };


var token = null;
var selectedId;
var selectedMode = CONTROL;
/**
* gets stats for the overall acount 
* @param {Object} characterJson - the character object for the account 
* @param {int} chars - 1,2 or 3 # of chars the account has
* @returns {StatsObj} objects containing lists of id for all activites an acount has played seperated by character and mode
*/
async function getCharacterStats(characterJson, chars) {

    var charId1 = null;
    var charId2 = null;
    var charId3 = null;

    var charClass = new Array(3);

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

    char1Stats.charId = charId1;
    char1Stats.charType = charClass[0];
    char2Stats.charId = charId2;
    char2Stats.charType = charClass[1];
    char3Stats.charId = charId3;
    char3Stats.charType = charClass[2];


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

    return allStats;
}
/**
 * gets the stats from the allStats object for the given mode and character
 * @param {int} mode - CONTROL, IORNBANNER et.
 * @param {int} charId - id for the character to get stats for
 */
async function getSessionStats(mode, charId) {
    /**@type {array} */
    let session;
    let winCount = 0;
    let loseCount = 0;
    let tieCount = 0;
    mercyCount = 0;
    var teamMates = [];
    var enemys = [];
    var player = [];
    var games = [];
    console.log(char1Stats.charId, charId);
    if (char1Stats.charId === charId) {
        session = char1Stats[mode];
    } else if (char2Stats.charId === charId) {
        session = char2Stats[mode];
    } else {
        session = char3Stats[mode];
    }
    console.log(session.length);
    graphStatsAll.all.sessionSize = session.length;
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

    graphStatsAll.all.loseCount = loseCount;
    graphStatsAll.all.mercyCount = mercyCount;
    graphStatsAll.all.tieCount = tieCount;
    graphStatsAll.all.winCount = winCount;


    graphStatsAll.player = await getGraphStats(player, mode, 'player');
    graphStatsAll.enemys = await getGraphStats(enemys, mode, 'enemys');
    graphStatsAll.teamMates = await getGraphStats(teamMates, mode, 'teamMates');

    return graphStatsAll;
}
/**gets aguragted stats about session
 * gets thats from list of players in session i.e. would pass list of objects that is all of the 
 * that represent eveyplayer on the enemy team across the session
 * @param {Object} players - array of players that stats are being gathered from
 * @param {int} mode - mode used for graph
 * @param {String} group - name of player group(player, enemys, or teamMates)
 * @return {graphStatsObject} 
 */
async function getGraphStats(players, mode, group) {
    graphStatsAll[group].allKills = 0;
    graphStatsAll[group].weaponKills = 0;
    graphStatsAll[group].grenadeKills = 0;
    graphStatsAll[group].meleeKills = 0;
    graphStatsAll[group].superKills = 0;
    graphStatsAll[group].primaryKills = 0;
    graphStatsAll[group].specialKills = 0;
    graphStatsAll[group].heavyKills = 0;
    graphStatsAll[group].otherAbilities = 0;
    graphStatsAll[group].kd = 0;
    graphStatsAll[group].kda = 0;
    graphStatsAll[group].overAllKd = 0;
    graphStatsAll[group].overAllKda = 0;
    graphStatsAll[group].itemTypeDisplayName = [];
    graphStatsAll[group].quit = 0
    graphStatsAll[group].numPlayers = players.length;

    let promises = [];

    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            promises.push(getKd(players[i].characterId, players[i].player.destinyUserInfo.membershipId, players[i].player.destinyUserInfo.membershipType, mode));
            for (let j = 0; j < players[i].extended.weapons.length; j++) {

                //skips classfied items their kills will not be counted in stats
                if (itemManifest[players[i].extended.weapons[j].referenceId].displayProperties.name === 'Classified') {
                    continue;
                }
                let itemAmmoType = itemManifest[players[i].extended.weapons[j].referenceId].equippingBlock.ammoType;
                let weaponKills = players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value;
                if (itemAmmoType === 1) {
                    graphStatsAll[group].primaryKills += weaponKills;
                } else if (itemAmmoType === 2) {
                    graphStatsAll[group].specialKills += weaponKills;
                } else if (itemAmmoType === 3) {
                    graphStatsAll[group].heavyKills += weaponKills;
                }
            }
        }
    }
    let data = await Promise.all(promises);
    data.forEach(weapon => {
        if (weapon.Response[Object.keys(weapon.Response)[0]].hasOwnProperty('allTime')) {
            graphStatsAll[group].overAllKd += weapon.Response[Object.keys(weapon.Response)[0]].allTime.killsDeathsRatio.basic.value;
            graphStatsAll[group].overAllKda += weapon.Response[Object.keys(weapon.Response)[0]].allTime.killsDeathsAssists.basic.value;
        }
    });

    for (let i = 0; i < players.length; i++) {
        if (players[i].extended.hasOwnProperty('weapons')) {
            graphStatsAll[group].allKills += players[i].values.kills.basic.value;
            graphStatsAll[group].grenadeKills += players[i].extended.values.weaponKillsGrenade.basic.value;
            graphStatsAll[group].meleeKills += players[i].extended.values.weaponKillsMelee.basic.value;
            graphStatsAll[group].superKills += players[i].extended.values.weaponKillsSuper.basic.value;
            graphStatsAll[group].otherAbilities += players[i].extended.values.weaponKillsAbility.basic.value;
            graphStatsAll[group].kd += players[i].values.killsDeathsRatio.basic.value;
            graphStatsAll[group].kda += players[i].values.killsDeathsAssists.basic.value;
            if (players[i].values.completed.basic.value === 0) {
                graphStatsAll[group].quit++;
            }
            for (let j = 0; j < players[i].extended.weapons.length; j++) {
                graphStatsAll[group].weaponKills += players[i].extended.weapons[j].values.uniqueWeaponKills.basic.value;
            }
        }
    }
    console.log(graphStatsAll);
    return graphStatsAll[group];
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


