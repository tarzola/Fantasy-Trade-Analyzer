console.log("script loaded");

const leagueId = "1242708409250226176";

let globalRosters = [];
let globalUsers = [];
let globalPlayers = {};
let globalTradedPicks = [];

document
.getElementById("loadLeagueBtn")
.addEventListener("click", loadLeagueData);

document
.getElementById("analyzeTradeBtn")
.addEventListener("click", analyzeTrade);

async function loadLeagueData() {

try {

const leagueResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}`
);

const usersResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`
);

const rostersResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`
);

const playersResponse = await fetch(
    "https://api.sleeper.app/v1/players/nba"
);

const tradedPicksResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/traded_picks`
);

const league = await leagueResponse.json();
const users = await usersResponse.json();
const rosters = await rostersResponse.json();
const players = await playersResponse.json();
const tradedPicks = await tradedPicksResponse.json();

globalRosters = rosters;
globalUsers = users;
globalPlayers = players;
globalTradedPicks = tradedPicks;

displayLeagueInfo(league);
populateTeamDropdowns();

} catch (error) {

console.error(error);
alert("Error loading league.");

}

}

function displayLeagueInfo(league) {

const leagueInfo = document.getElementById("leagueInfo");

leagueInfo.innerHTML = `
    <h2>${league.name}</h2>
    <p>Season: ${league.season}</p>
    <p>Teams: ${league.total_rosters}</p>
`;
}

function populateTeamDropdowns() {

const teamASelect = document.getElementById("teamASelect");
const teamBSelect = document.getElementById("teamBSelect");

teamASelect.innerHTML =
    '<option value="">Select Team</option>';

teamBSelect.innerHTML =
    '<option value="">Select Team</option>';

globalRosters.forEach(roster => {

const owner = globalUsers.find(
    user => user.user_id === roster.owner_id
);

const teamName =
    owner?.metadata?.team_name ||
    owner?.display_name ||
    "Unknown Team";

const optionA = document.createElement("option");
optionA.value = roster.roster_id;
optionA.textContent = teamName;

const optionB = document.createElement("option");
optionB.value = roster.roster_id;
optionB.textContent = teamName;

teamASelect.appendChild(optionA);
teamBSelect.appendChild(optionB);

});

teamASelect.addEventListener("change", displayTeamARoster);
teamBSelect.addEventListener("change", displayTeamBRoster);

}

function displayTeamARoster() {

displaySelectedRoster(
document.getElementById("teamASelect").value,
document.getElementById("teamARoster"),
"teamA"
);

}

function displayTeamBRoster() {

displaySelectedRoster(
document.getElementById("teamBSelect").value,
document.getElementById("teamBRoster"),
"teamB"
);

}

function displaySelectedRoster(rosterId, targetDiv, prefix) {

const roster = globalRosters.find(
r => r.roster_id == rosterId
);

if (!roster) {

targetDiv.innerHTML = "";
return;

}

let html = "<h4>Players</h4>";

roster.players.forEach(playerId => {

const player =
    globalPlayers[playerId];

const playerName =
    player?.full_name ||
    `Unknown (${playerId})`;

html += `
    <div class="player-checkbox">
        <label>
            <input
                type="checkbox"
                class="${prefix}-asset"
                value="${playerName}">
            ${playerName}
        </label>
    </div>
`;

});

html += "<hr>";
html += "<h4>Draft Picks</h4>";

const rosterPicks = [];

// Start with all original picks
for (let season = 2026; season <= 2028; season++) {

for (let round = 1; round <= 3; round++) {

    rosterPicks.push({
        season,
        round,
        ownerId: roster.roster_id
    });

}

}

// Apply traded picks
globalTradedPicks.forEach(pick => {

if (pick.owner_id == roster.roster_id) {

    rosterPicks.push({
        season: pick.season,
        round: pick.round,
        ownerId: roster.roster_id
    });

}

if (pick.previous_owner_id == roster.roster_id) {

    const index = rosterPicks.findIndex(p =>
        p.season == pick.season &&
        p.round == pick.round
    );

    if (index !== -1) {
        rosterPicks.splice(index, 1);
    }

}

});

rosterPicks
.sort((a, b) => {

if (a.season !== b.season) {
    return a.season - b.season;
}

return a.round - b.round;

})
.forEach(pick => {

const pickName =
    `${pick.season} Round ${pick.round}`;

html += `
    <div class="player-checkbox">
        <label>
            <input
                type="checkbox"
                class="${prefix}-asset"
                value="${pickName}">
            ${pickName}
        </label>
    </div>
`;

});

targetDiv.innerHTML = html;

}

function analyzeTrade() {

const teamAAssets =
document.querySelectorAll(".teamA-asset:checked");

const teamBAssets =
document.querySelectorAll(".teamB-asset:checked");

let teamAList = "";
let teamBList = "";

teamAAssets.forEach(asset => {

teamAList += `<li>${asset.value}</li>`;

});

teamBAssets.forEach(asset => {

teamBList += `<li>${asset.value}</li>`;

});

document.getElementById("tradeResults").innerHTML = `
    <h3>Trade Summary</h3>

<div style="display:flex; gap:40px;">

    <div>
        <h4>Team A Gives</h4>
        <ul>
            ${teamAList || "<li>Nothing Selected</li>"}
        </ul>
    </div>

    <div>
        <h4>Team B Gives</h4>
        <ul>
            ${teamBList || "<li>Nothing Selected</li>"}
        </ul>
    </div>

</div>

`;

}
