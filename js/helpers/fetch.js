/* This is the code for fetching and then organizing the data for the usersAndPoints array after
 * fetching data from the speedrun.com rest API */

/* Function to that returns the desired amount of  leaderboard placements for a given category ID
 * and game ID. It will return an array of sorted javascript objects that represent runs that
 * will have the name of the runner, time of the run, and if it was emulator or vc. It will also
 * include a "ConsoleEquivalentTime" which is the time converted to console using the offsets from the
 * state.js file */
async function fetchLeaderboardPlacements(categoryID, gameID) {
    try {
        /* Console, Emulator, and WiiVC times */
        const [resConsolePlacements, resEmuPlacements, resWiiVcPlacements] = await Promise.all([
            fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?embed=players&top=${numLBPlacements}&emulators=false&platform=${N64_ID}`),
            fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?embed=players&top=${numLBPlacements}&emulators=true&platform=${N64_ID}`),
            fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?embed=players&top=${numLBPlacements}&platform=${WIIVC_ID}`)
        ]);

        if (!resConsolePlacements.ok || !resEmuPlacements.ok || !resWiiVcPlacements.ok) {
            throw new Error('There was an error in one or more of the leaderboard fetches');
        }


        const consoleData = await resConsolePlacements.json();
        const emuData = await resEmuPlacements.json();
        const wiiVcData = await resWiiVcPlacements.json();
       
        // console.log(`console placements for ${categoryID}`) 
        // console.log(consoleData);
        
        // console.log(`emu placements for ${categoryID}`) 
        // console.log(emuData);

        // console.log(`wiivc placements for ${categoryID}`) 
        // console.log(wiiVcData);


        /* using the createCombinedLeaderboard function, create a combined leaderboard with the three platforms,
         * assign that combined leaderboard to this value */
        let combinedLeaderboard = createCombinedLeaderboard(consoleData, emuData, wiiVcData, categoryID);
    
        /* Sort the combinedLeaderboard in ascending order */
        combinedLeaderboard.sort((a, b) => a.consoleEquivalentTime - b.consoleEquivalentTime)

        console.log(`combined leaderboard for category ${CategoryIDtoString(categoryID)}`);
        console.log(combinedLeaderboard);


        return combinedLeaderboard;

    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

/* This function takes one or more leaderboards and "Combines them" based on the offsets 
 * for the emu, vc, and console leaderboards */
function createCombinedLeaderboard(consoleData, emuData, wiiVcData, categoryID) {

    /* create an array of objects that will each represent a run and 
     * how long it took in seconds */
    const runsArray = [];

    /* First, loop through the consoledata, initially creating the leaderboard from that with
     * it's obviously console equivalent times */
    loopThroughDataAndAddToRunsAway(consoleData, runsArray, categoryID)
    /* Second, loop through the emulator data, adding runs if an identical for this category is
     * not found, if an identical run for this category IS found though, then compare them based
     * on what their console equivalent time is, if the found run is better, keep it, otherwise, 
     * replace the run with the emu run */
    loopThroughDataAndAddToRunsAway(emuData, runsArray, categoryID)
    /* Third, loop through the wiiVc data, adding runs if an identical run for the category is 
     * not found for the player, if one is found though compare them and replace like before */
    loopThroughDataAndAddToRunsAway(wiiVcData, runsArray, categoryID)

    return runsArray;
}

/* Function to loop through a json object that is the platform data, 
 * and add it to the runsArray, runsArray is passed by reference */
function loopThroughDataAndAddToRunsAway(platformData, runsArray, categoryID) {

    // Get the length of the players/runs that we will loop through
    // console.log(platformData.data.runs.length);
    const numRuns = platformData.data.runs.length;
    // Loop through the console runs, getting the name of the player and time of the run
    for (let i = 0; i < numRuns; i++) {

        // Get the name of the player (check if it's in a "names" key)
        let playerName = "";
        if (platformData.data.players.data[i].names) {
            // console.log(platformData.data.players.data[i].names.international);
            playerName = platformData.data.players.data[i].names.international;
        }

        // Get the name of the player the other way (check if it's in a "name" key)
        if (platformData.data.players.data[i].name) {
            // console.log(platformData.data.players.data[i].name);
            playerName = platformData.data.players.data[i].name;
        }

        let userId = 0;
        // Get the ID of the player
        if (platformData.data.players.data[i].id) {
            userId = platformData.data.players.data[i].id;
        }

        /* Get the players icon (checking if it's in "assets" key) */
        let playerIcon = "";
        if (platformData.data.players.data[i].assets !== undefined) { // Make sure it's not undefined
            playerIcon = platformData.data.players.data[i].assets.image.uri;
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
        if (platformData.data.players.data[i]["name-style"] !== undefined && platformData.data.players.data[i]["name-style"]["color-from"] !== undefined) {
            colorFromDark = platformData.data.players.data[i]["name-style"]["color-from"].dark;
            colorFromLight = platformData.data.players.data[i]["name-style"]["color-from"].light;
        }

        let colorToDark = "#000000"
        let colorToLight = "#000000";
        if (platformData.data.players.data[i]["name-style"] !== undefined && platformData.data.players.data[i]["name-style"]["color-from"] !== undefined) {
            colorToDark = platformData.data.players.data[i]["name-style"]["color-to"].dark;
            colorToLight = platformData.data.players.data[i]["name-style"]["color-to"].light;
        }

        let playerColorsArray = [colorFromDark, colorFromLight, colorToDark, colorToLight];
        // console.log(`Player ${[playerName]}'s colors:`)
        // console.log(playerColorsArray);

        // Assume we ARE going to add a new run object
        let addNewRun = true;
        // Get the time and platform of the run of the run
        let runTime = platformData.data.runs[i].run.times.realtime_t;
        let platform = platformData.data.runs[i].run.system.platform;
        let emulated = platformData.data.runs[i].run.system.emulated;
        let platformInStringForm = "";
        let consoleRunTime = platformData.data.runs[i].run.times.realtime_t;
        if (platform == N64_ID && emulated == false) { // it's console
            platformInStringForm = "console";
        } else if (platform == N64_ID && emulated == true) { // it's emulator
            platformInStringForm = "emulator";
            let timeToAdd = emulator_offsets[categoryID];
            consoleRunTime += timeToAdd;
            /* Check if there are already any console runs in the RunsArray
             * with this same user, if there is, compare them and see which is better */
            const possiblySlowerConsoleRun = runsArray.find(obj => obj.name === playerName);
            if (possiblySlowerConsoleRun !== undefined) {  // Found a run in the same category in console
                addNewRun = false;
                //console.log(`found identical run for player ${playerName}`);
                //console.log(`In run category ${CategoryIDtoString(categoryID)}, comparing an emulator time of ${consoleRunTime} to a ${possiblySlowerConsoleRun.consoleEquivalentTime}`);
                if (consoleRunTime < possiblySlowerConsoleRun.consoleEquivalentTime) { // This emu time is better, so replace it
                    // console.log(`Better console time than emu found for player ${playerName}`);
                    /* Effectively replace the object by updating the times and platform */
                    possiblySlowerConsoleRun.consoleEquivalentTime = consoleRunTime;
                    possiblySlowerConsoleRun.time = platformData.data.runs[i].run.times.realtime_t;
                    possiblySlowerConsoleRun.platform = "emulator"
                }
            }
        } else if (platform == WIIVC_ID) { // it's VC
            platformInStringForm = "virtual_console";
            let timeToAdd = wiivc_offsets[categoryID];
            consoleRunTime += timeToAdd;
            /* Check if there are already any emulator runs in the RunsArray
             * with this same user, if there is, compare them and see which is better */
            const possiblySlowerEmulatorRun = runsArray.find(obj => obj.name === playerName);
            if (possiblySlowerEmulatorRun !== undefined) {  // Found a run in the same category in emu
                addNewRun = false;
                if (consoleRunTime < possiblySlowerEmulatorRun.consoleEquivalentTime) { // This emu time is better, so replace it
                    // console.log(`Better emu time than wii vc time found for player ${playerName}`);
                    /* Effectively replace the object by updating the times and platform */
                    possiblySlowerEmulatorRun.consoleEquivalentTime = consoleRunTime;
                    possiblySlowerEmulatorRun.time = platformData.data.runs[i].run.times.realtime_t;
                    possiblySlowerEmulatorRun.platform = "virtual_console";
                }
            }
        }

        /* Create the run object that will represent the run and it's
         * details, only if we didn't already find a duplicate */
        if (addNewRun == true) {
            const runObject = new Object({
            name: playerName,
            playerColors: playerColorsArray,
            playerIcon: playerIcon,
            time: runTime,
            platform: platformInStringForm,
            consoleEquivalentTime: consoleRunTime,
        });
        runsArray.push(runObject);
        }

    }
}

/* Helper method for turning category ID's into their string form */
function CategoryIDtoString(categoryID) {
    switch (categoryID) {
        case CATEGORY_120_STAR_ID:
            return "120 Star";
        case CATEGORY_70_STAR_ID:
            return "70 Star";
        case CATEGORY_16_STAR_ID:
            return "16 Star";
        case CATEGORY_1_STAR_ID:
            return "1 Star";
        case CATEGORY_0_STAR_ID:
            return "0 Star";
        default:
            return "Not found.";
    }
}


