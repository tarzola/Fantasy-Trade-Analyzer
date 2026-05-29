console.log("script loaded");

const leagueId = "1242708409250226176";

let globalRosters = [];
let globalUsers = [];
let globalPlayers = {};

document
.getElementById("loadLeagueBtn")
.addEventListener("click", loadLeagueData);

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

    const league = await leagueResponse.json();
    const users = await usersResponse.json();
    const rosters = await rostersResponse.json();
    const players = await playersResponse.json();

    globalRosters = rosters;
    globalUsers = users;
    globalPlayers = players;

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

function displayRosters(rosters, users, players) {

const container = document.getElementById("rostersContainer");

container.innerHTML = "";

rosters.forEach(roster => {

    const owner = users.find(
        user => user.user_id === roster.owner_id
    );

    const ownerName =
        owner?.metadata?.team_name ||
        owner?.display_name ||
        "Unknown Owner";

    const card = document.createElement("div");

    card.classList.add("roster-card");

    let playerNames = "";

    if (roster.players) {

        roster.players.slice(0, 10).forEach(playerId => {

            const player = players[playerId];

            const playerName =
                player?.full_name ||
                `Unknown (${playerId})`;

            playerNames += `${playerName}<br>`;

        });

    }

    card.innerHTML = `
        <h3>${ownerName}</h3>
        <p>Players: ${roster.players?.length || 0}</p>

        <div class="player-list">
            <strong>First 10 Players:</strong><br>
            ${playerNames}
        </div>
    `;

    container.appendChild(card);

});

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
    document.getElementById("teamARoster")
);

}

function displayTeamBRoster() {

displaySelectedRoster(
    document.getElementById("teamBSelect").value,
    document.getElementById("teamBRoster")
);

}

function displaySelectedRoster(rosterId, targetDiv) {

const roster = globalRosters.find(
    r => r.roster_id == rosterId
);

if (!roster) {

    targetDiv.innerHTML = "";
    return;

}

let html = "";

roster.players.forEach(playerId => {

    const player =
        globalPlayers[playerId];

    const playerName =
        player?.full_name ||
        `Unknown (${playerId})`;

    html += `
        <div class="player-checkbox">
            <label>
                <input type="checkbox"
                       value="${playerName}">
                ${playerName}
            </label>
        </div>
    `;

});

targetDiv.innerHTML = html;

}
