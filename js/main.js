/* I will be using the documentation from the speedrun.com API
 * to get data from the speedrun.com website, specifically data
 * from the SM64 leaderboards for 0, 1, 16, 70, and 120 star the
 * game ID for SM64 is o1y9wo6q */

// unchanging ID for SM64 as a game
const SM64_GAME_ID = "o1y9wo6q";

// unchanging ID's for 0, 1, 16, 70, and 120 star
const CATEGORY_120_STAR_ID = "wkpoo02r";
const CATEGORY_70_STAR_ID = "7dgrrxk4";
const CATEGORY_16_STAR_ID = "n2y55mko";
const CATEGORY_1_STAR_ID = "7kjpp4k3";
const CATEGORY_0_STAR_ID = "xk9gg6d0";

// unchanging ID's for the platforms (n64 is n64 for both emu and console, just need to check if emulated is true in json)
const N64_ID = "w89rwelk";
const WIIVC_ID = "nzelreqp";

/* Lookup tables for both emu and vc for how much time emu saves over console based on
 * the category ID ( these are pulled from this sheet below, except the 0 and 1 star times are estimated:
 * https://docs.google.com/spreadsheets/d/1YBWWIjdP33ubsn0E8IZW8fJwTbqbxtjQJex-izvtSAE/edit?gid=472228052#gid=472228052 )*/
const emulator_offsets = {
    "wkpoo02r": 54.23, // 120
    "7dgrrxk4": 27.83, // 70
    "n2y55mko": 7.96, // 16
    "7kjpp4k3": 3, // 1 (estimated)
    "xk9gg6d0": 2 // 0 (estimated)
}

const wiivc_offsets = {
    "wkpoo02r": 110.88, // 120
    "7dgrrxk4": 63.61, // 70
    "n2y55mko": 19.57, // 16
    "7kjpp4k3": 8, // 1 (estimated)
    "xk9gg6d0": 4 // 0 (estimated)
}

/* Function to that returns the desired amount of 
 * leaderboard placements for a given category ID,
 * game ID, and platform ID. It will return an array
 * of sorted javascript objects that represent runs that
 * will have the name of the runner, time of the run, and 
 * if it was emulator or vc it's converted to the time of
 * a console run and sorted */
async function getLeaderboardPlacements(categoryID, gameID) {
    try {
        /* TODO: try to figureout how to get both times and decide which one is better, this fetch is only returning 
         * one of raisn's times for example, the better one on the emulator lb, but if converted to console time his 
         * console pb is actually the better one, so I'll have to look into that */
        const res = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?embed=players`);

        if (!res.ok) {
            throw new Error('HTTP error: ${res.status}');
        }

        const data = await res.json();
       
        console.log(data);

        /* Loop through them and add them to a 120 runs array, creating an array of objects
        * that will each represent a run and how long it took in seconds */
        const lb120array = [];

        // Get the length of the players/runs that we will loop through
        console.log(data.data.runs.length);
        const numRuns = data.data.runs.length;

        // Loop the runs, getting the name of the player and time of the run
        for (let i = 0; i < numRuns; i++) {
            // Get the name of the player (check if it's in a "names" key)
            let playerName = "";
            if (data.data.players.data[i].names) {
                // console.log(data.data.players.data[i].names.international);
                playerName = data.data.players.data[i].names.international;
            }
            // Get the name of the player the other way (check if it's in a "name" key)
            if (data.data.players.data[i].name) {
                // console.log(data.data.players.data[i].name);
                playerName = data.data.players.data[i].name;
            }
            
            // Get the time and platform of the run of the run
            let runTime = data.data.runs[i].run.times.realtime_t;
            let platform = data.data.runs[i].run.system.platform;
            let emulated = data.data.runs[i].run.system.emulated;
            let platformInStringForm = "";
            let consoleRunTime = data.data.runs[i].run.times.realtime_t;
            if (platform == N64_ID && emulated == false) { // it's console
                platformInStringForm = "console";
            } else if (platform == N64_ID && emulated == true) { // it's emulator
                platformInStringForm = "emulator";
                let timeToAdd = emulator_offsets[categoryID];
                consoleRunTime += timeToAdd;
            } else if (platform == WIIVC_ID) { // it's VC
                platformInStringForm = "virtual_console";
                let timeToAdd = wiivc_offsets[categoryID];
                consoleRunTime += timeToAdd;
            }

            /* Create the run object that will represent the run and it's
             * details */
            const runObject = new Object({
                name: playerName,
                time: runTime,
                platform: platformInStringForm,
                consoleEquivalentTime: consoleRunTime
            });
            lb120array.push(runObject);

        }

        /* Sort the lb120array in ascending order by the consoleEquivalentTime value 
         * so that emulator and wiiVC runs are put in the right "rank" as far as their 
         * console equivalent time goes */
        lb120array.sort((a, b) => a.consoleEquivalentTime - b.consoleEquivalentTime)

        return lb120array;

    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

/* Get 120/70/16/1/0 star leaderboard times, that includes N64, emu, and console, */
// TODO: get 1 and 0 star
async function getFiveMainCategories() {
    const lb120 = await getLeaderboardPlacements(CATEGORY_120_STAR_ID, SM64_GAME_ID);
    console.log("120 Leaderboard Array:")
    console.log(lb120);
    const lb70 = await getLeaderboardPlacements(CATEGORY_70_STAR_ID, SM64_GAME_ID);
    console.log("70 Leaderboard Array:")
    console.log(lb70);
    const lb16 = await getLeaderboardPlacements(CATEGORY_16_STAR_ID, SM64_GAME_ID);
    console.log("16 Leaderboard Array:")
    console.log(lb16);
    
}


getFiveMainCategories();




/* TODO: Convert Emu times to their "console equivalent times" */

/* TODO: Convert VC times to their "console equivalent times" */

/* TODO: Get the console leaderboard times, and combine that with the VC and EMU converted times, if remove
 * duplicates and use the better if there are any */

