/* This code is the "main" flow of the program. This code includes global variables that are used, 
 * and also the main arrays as well. This is like the "model" or the "data" of the application that will
 * be accessed from the other files */

/* The other files other than this will contain the html elements selected, event listeners for them, and functionality
 * for seperate parts of this application and have been named accordingly */

/* Almost all of these .js files including this one have console.log lines in them stating what 
 * certain parts of the code are doing. these can be uncommented as needed for testing purposes */

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

// Look up table for Category weights (how much they are worth in terms of points)
// (TODO: allow these to be changed dynamically by the user, maybe save them in local storage?)
let category_weights = {
    "wkpoo02r": 1.0, // 120
    "7dgrrxk4": 1.0, // 70
    "n2y55mko": 1.0, // 16
    "7kjpp4k3": 1.0, // 1 
    "xk9gg6d0": 1.0 // 0
}

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

/* Arrays for the 5 categories, these will be accessed and re-used throughout the code and
 * be assigned values in the getFiveCategories() function and then constantly
 * be re-used to by the loopThroughLeaderBoard() function to create the overallLeaderboard
 *  which is usersAndPointsARray */
let lb120 = [];
let lb70 = [];
let lb16 = [];
let lb1 = [];
let lb0 = [];

// Variable to keep track of when we finally got the data
let dataRetrieved = false;

/* Array for users and their "points" that they have earned from their
 * place on the leaderboards */
const usersAndPointsArray = [];

/* Number that will determine what number of placements to get from each
 * leaderboard */
const numLBPlacements = 1000;

/* Number that represents the current page that is being displayed */
let currentPage = 1;
let finalPage = 0; // This will be calculated and set to a number after the usersAndPointsArray is completed 

/* Function to that returns the desired amount of  leaderboard placements for a given category ID,
 * game ID, and platform ID. It will return an array of sorted javascript objects that represent runs that
 * will have the name of the runner, time of the run, and if it was emulator or vc it's converted to the time of
 * a console run and sorted */
async function getLeaderboardPlacements(CategoryID, gameID) {
    try {
        /* TODO: An issue is occurring because this GET request will return an "overall" leaderboard, but it will not
         * duplicate times from a player if they have times on the same category but from different platforms, instead
         * it just takes the best time of the three. The problem is that the converted time to console COULD be better
         * than their emulator time for example, or wii vc, and this is happening with xRaisn's time where his console pb
         * which is "better" than his emu pb is not being displayed and instead it's his emulator pb. The fix would
         * probably involve getting from each platform instead of just all, which may take more get requests or maybe
         * I can figure out how to do it in one get request still. For now I'm not worried about this though. */
        const res = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${CategoryID}?embed=players&top=${numLBPlacements}`);


        if (!res.ok) {
            throw new Error('HTTP error: ${res.status}');
        }

        const data = await res.json();
       
        console.log(data);

        /* Loop through them and add them to a runs array, creating an array of objects
        * that will each represent a run and how long it took in seconds */
        const lbarray = [];

        // Get the length of the players/runs that we will loop through
        // console.log(data.data.runs.length);
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

            /* Get the players icon (checking if it's in "assets" key) */
            let playerIcon = "";
            if (data.data.players.data[i].assets !== undefined) { // Make sure it's not undefined
                playerIcon = data.data.players.data[i].assets.image.uri;
                /* Regex to turn the http in the string to an https */
                if (playerIcon !== null) {
                    playerIcon = playerIcon.replace(/^http:\/\//, "https://");
                }
                // console.log(`Found player icon ${playerIcon} for player ${playerName}`);
            }

            /* Get the players colors from the gradients (theres to colors, the fromColor, and the toColor) */

            /* Array of colors that will be the value instead of using 4 different variables: */
            
            let colorFromDark = "#000000"
            let colorFromLight = "#000000";
            if (data.data.players.data[i]["name-style"] !== undefined && data.data.players.data[i]["name-style"]["color-from"] !== undefined) {
                colorFromDark = data.data.players.data[i]["name-style"]["color-from"].dark;
                colorFromLight = data.data.players.data[i]["name-style"]["color-from"].light;
            }

            let colorToDark = "#000000"
            let colorToLight = "#000000";
            if (data.data.players.data[i]["name-style"] !== undefined && data.data.players.data[i]["name-style"]["color-from"] !== undefined) {
                colorToDark = data.data.players.data[i]["name-style"]["color-to"].dark;
                colorToLight = data.data.players.data[i]["name-style"]["color-to"].light;
            }
            
            let playerColorsArray = [colorFromDark, colorFromLight, colorToDark, colorToLight];
            // console.log(`Player ${[playerName]}'s colors:`)
            // console.log(playerColorsArray);

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
                let timeToAdd = emulator_offsets[CategoryID];
                consoleRunTime += timeToAdd;
            } else if (platform == WIIVC_ID) { // it's VC
                platformInStringForm = "virtual_console";
                let timeToAdd = wiivc_offsets[CategoryID];
                consoleRunTime += timeToAdd;
            }

            /* Create the run object that will represent the run and it's
             * details */
            const runObject = new Object({
                name: playerName,
                playerColors: playerColorsArray,
                playerIcon: playerIcon,
                time: runTime,
                platform: platformInStringForm,
                consoleEquivalentTime: consoleRunTime
            });
            lbarray.push(runObject);

        }

        /* Sort the lbarray in ascending order by the consoleEquivalentTime value 
         * so that emulator and wiiVC runs are put in the right "rank" as far as their 
         * console equivalent time goes */
        lbarray.sort((a, b) => a.consoleEquivalentTime - b.consoleEquivalentTime)

        return lbarray;

    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

/* Get 120/70/16/1/0 star leaderboard times, that includes N64, emu, and console, assigning them
to the variables above */
async function getFiveCategories() {
    [lb120, lb70, lb16, lb1, lb0] = await Promise.all([
        getLeaderboardPlacements(CATEGORY_120_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_70_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_16_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_1_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_0_STAR_ID, SM64_GAME_ID),
    ])
    dataRetrieved = true;
    /* After getting the five categories, that is when we can display the 
    overall leaderboard: */
    calculateOverallLeaderboard();
}

// Run the above function (TODO: just make it anonymous since we only need to run it once)
getFiveCategories();









