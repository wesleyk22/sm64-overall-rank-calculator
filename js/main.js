/* I will be using the documentation from the speedrun.com API
 * to get data from the speedrun.com website, specifically data
 * from the SM64 leaderboards for 0, 1, 16, 70, and 120 star the
 * game ID for SM64 is o1y9wo6q */

// unchanging ID for SM64 as a game
const SM64_GAME_ID = "o1y9wo6q";

// unchanging ID's for 0, 1, 16, 70, and 120 star
const CATEGORY_120_STAR_ID = "wkpoo02r";
const CATEGORY_70_STAR_ID = "n2y55vdn";
const CATEGORY_16_STAR_ID = "wkpox7dr";
const CATEGORY_1_STAR_ID = "9d8e7n1l";
const CATEGORY_0_STAR_ID = "jdr9z1k4";

// Get 120 star top 100
async function getTop100For120Star() {
    try {
        const res = await fetch('https://www.speedrun.com/api/v1/leaderboards/o1y9wo6q/category/wkpoo02r?top=100');

        if (!res.ok) {
            throw new Error('HTTP error: ${res.status}');
        }

        const data = await res.json();
        // console.log(data);

        // Work with the json data
        // console.log(data.data.runs)
        const runs = data.data.runs;
        const ids = runs.map(r => r.run.players[0].id);
        const userObjects = await Promise.all(
            ids.map(id => 
                fetch(`https://www.speedrun.com/api/v1/users/${id}`).then(r =>r.json())
            )
        )
        const userNames = userObjects.map(obj => obj.data.names.international);
        console.log(userNames);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

getTop100For120Star();