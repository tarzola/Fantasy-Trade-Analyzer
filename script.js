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

    } catch (error) {
        console.error(error);
        alert("Error loading league.");
    }
}
