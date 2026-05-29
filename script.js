console.log("script loaded");
const leagueId = "1242708409250226176";

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

        const league = await leagueResponse.json();
        const users = await usersResponse.json();
        const rosters = await rostersResponse.json();

        displayLeagueInfo(league);
        displayRosters(rosters, users);
        console.log(owner);

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
function displayRosters(rosters, users) {

    const container =
        document.getElementById("rostersContainer");

    container.innerHTML = "";

    rosters.forEach(roster => {

        const owner = users.find(
            user => user.user_id === roster.owner_id
        );

        const ownerName =
            owner?.display_name || "Unknown Owner";

        const card = document.createElement("div");

        card.classList.add("roster-card");

        card.innerHTML = `
            <h3>${ownerName}</h3>
            <p>Players: ${roster.players?.length || 0}</p>
        `;

        container.appendChild(card);
    });
}
