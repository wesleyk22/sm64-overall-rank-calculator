/* This is the code for fetching and then organizing the data for the usersAndPoints array after
 * fetching data from the speedrun.com rest API */

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
                consoleEquivalentTime: consoleRunTime,
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

/* Re-usable function to loop through a leaderboard, and assign points to the usersAndPointsArray */
function loopThroughLeaderBoard(leaderboard, categoryID) {
    /* Calculate weight based on category ID */
    let weight = category_weights[categoryID];
     /* Loop through the array, check if the user is already in the array,
     * if the user is already in the array, then add points, if the user was not in 
     * the array, then add a new user */
    leaderboard.forEach((run, index) => {
        // Calculate points (1000 for first place, 500 for second place, 333 for third place, etc...)
        let calculatedPoints = (weight * ( 1000 * ( 1 / (index + 1) ) ) );
        let playerName = run.name;
        let playerIcon = run.playerIcon;
        let playerColors = run.playerColors;

        // Check if the user is already in the usersAndPoints array
        const player = usersAndPointsArray.find(obj => obj.name === playerName);

        if (player !== undefined) { // If true then we found the object with the matching player name
            // console.log(`Found player named ${player.name} giving them ${calculatedPoints} points`);
            player.points += calculatedPoints; // Give them points
            updatePlayerRank(player, categoryID, (index+1));
        } else { // otherwise, we need to create a new player object and award them with the points
            const userObject = new Object({
                name: run.name,
                icon: playerIcon,
                points: calculatedPoints,
                colors: playerColors,
                ranks: {
                    "120": -1,
                    "70": -1,
                    "16": -1,
                    "1": -1,
                    "0": -1,
                }
            
            });
            updatePlayerRank(userObject, categoryID, (index+1));
            usersAndPointsArray.push(userObject);
        }
    });
}

/* Helper function to update the "rank" attribute in a user object
 * in the usersAndPointsArray */
function updatePlayerRank(userObject, categoryID, rank) {
    /* Update the "ranks" attribute of the userObject */
    if (categoryID == CATEGORY_120_STAR_ID) {
        userObject.ranks["120"] = rank;
    } else if (categoryID == CATEGORY_70_STAR_ID) {
        userObject.ranks["70"] = rank;
    } else if (categoryID == CATEGORY_16_STAR_ID) {
        userObject.ranks["16"] = rank;
    } else if (categoryID == CATEGORY_1_STAR_ID) {
        userObject.ranks["1"] = rank;
    } else if (categoryID == CATEGORY_0_STAR_ID) {
        userObject.ranks["0"] = rank;
    }
}