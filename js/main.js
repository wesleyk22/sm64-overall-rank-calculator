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

// Look up table for Category weights (how much they are worth in terms of points)
// (TODO: allow these to be changed dynamically by the user, maybe save them in local storage?)
let category_weights = {
    "wkpoo02r": 1, // 120
    "7dgrrxk4": 1, // 70
    "n2y55mko": 1, // 16
    "7kjpp4k3": 1, // 1 
    "xk9gg6d0": 1 // 0
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

/* Array for users and their "points" that they have earned from their
 * place on the leaderboards */
const usersAndPointsArray = [];

/* Number that will determine what number of placements to get from each
 * leaderboard */
const numLBPlacements = 125;

/* Number that represents the current page that is being displayed */
let currentPage = 1;
let finalPage = 0; // This will be calculated and set to a number after the usersAndPointsArray is completed 

/* HTML elements that are selected and assigned to variables */
const overallLeaderboardContainer = document.querySelector(".overall-leaderboard-container");
const categoryWeightsContainer = document.querySelector(".category-weights-container");
const overallLeaderboardButton = document.querySelector(".lb-button");
const categoryWeightsButton = document.querySelector(".category-weights-button");
const overallLeaderboardNavPanel = document.querySelector(".overall-lb-nav-panel")
const cycleLeftButton = document.querySelector(".page-cycle-left");
const cycleRightButton = document.querySelector(".page-cycle-right");
const pageText = document.querySelector(".page-text");

/* Function to that returns the desired amount of 
 * leaderboard placements for a given category ID,
 * game ID, and platform ID. It will return an array
 * of sorted javascript objects that represent runs that
 * will have the name of the runner, time of the run, and 
 * if it was emulator or vc it's converted to the time of
 * a console run and sorted */
async function getLeaderboardPlacements(categoryID, gameID) {
    try {
        /* TODO: An issue is occurring because this GET request will return an "overall" leaderboard, but it will not
         * duplicate times from a player if they have times on the same category but from different platforms, instead
         * it just takes the best time of the three. The problem is that the converted time to console COULD be better
         * than their emulator time for example, or wii vc, and this is happening with xRaisn's time where his console pb
         * which is "better" than his emu pb is not being displayed and instead it's his emulator pb. The fix would
         * probably involve getting from each platform instead of just all, which may take more get requests or maybe
         * I can figure out how to do it in one get request still. For now I'm not worried about this though. */
        const res = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?embed=players&top=${numLBPlacements}`);


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
async function getOverallLeaderboard() {
    const [lb120, lb70, lb16, lb1, lb0] = await Promise.all([
        getLeaderboardPlacements(CATEGORY_120_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_70_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_16_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_1_STAR_ID, SM64_GAME_ID),
        getLeaderboardPlacements(CATEGORY_0_STAR_ID, SM64_GAME_ID),
    ])

    /* Loop through all 5 of these leaderboards using the
     *  loopThroughLeaderBoard function */
    loopThroughLeaderBoard(lb120, 1);
    loopThroughLeaderBoard(lb70, 1);
    loopThroughLeaderBoard(lb16, 1);
    loopThroughLeaderBoard(lb1, 0.5);
    loopThroughLeaderBoard(lb0, 0.5);

    /* Sort the usersAndPointsArray by points before displaying it */
    usersAndPointsArray.sort((a, b) => b.points - a.points);

    /* Based on the size of the array, calculate the final page number
     * and set that variable accordingly */
    finalPage = Math.floor( usersAndPointsArray.length / 50 ); // The final page will be the length divided by 50 rounded down
    console.log(`final page calculated to be ${finalPage}`);
    pageText.innerHTML = `Page ${currentPage} of ${finalPage}`;

     /* Display overall leaderboard based on their users and points */
    console.log("users and their points:");
    console.log(usersAndPointsArray);
    // Start by displaying the first page
    visuallyDisplayPage(currentPage);
    // usersAndPointsArray.forEach((playerObject, index) => {
    //     let name = playerObject.name;
    //     let points = playerObject.points;
    //     let placement = (index+1);
    //     visuallyAddPlacement(placement, name, points);
    // });
}

/* Re-usable function to loop through a leaderboard, and assign points to the usersAndPointsArray */
function loopThroughLeaderBoard(leaderboard, weight) {
     /* Loop through the array, check if the user is already in the array,
     * if the user is already in the array, then add points, if the user was not in 
     * the array, then add a new user */
    leaderboard.forEach((run, index) => {
        // Calculate points (1000 for first place, 500 for second place, 333 for third place, etc...)
        let calculatedPoints = (weight * ( 1000 * ( 1 / (index + 1) ) ) );
        let playerName = run.name;

        // Check if the user is already in the usersAndPoints array
        const player = usersAndPointsArray.find(obj => obj.name === playerName);

        if (player !== undefined) { // If true then we found the object with the matching player name
            // console.log(`Found player named ${player.name} giving them ${calculatedPoints} points`);
            player.points += calculatedPoints; // Give them points
        } else { // otherwise, we need to create a new player object and award them with the points
            const userObject = new Object({
                name: run.name,
                points: calculatedPoints
            });
            usersAndPointsArray.push(userObject);
        }
    });
}

/* Function to visually display an overall leaderboard placement in the DOM */
function visuallyAddPlacement(placement, name, points) {
    const placementDiv = document.createElement("div");
    placementDiv.classList.add("leaderboard-place-panel");
    placementDiv.textContent = `#${placement} - ${name} (${points.toFixed(2)})`;
    overallLeaderboardContainer.appendChild(placementDiv);
}

/* Function to display a "page" of the leaderboard. Each page will have 50
 * placements */
function visuallyDisplayPage(pageNum) {
    // Remove all placements that are inside leaderboard container
    overallLeaderboardContainer.replaceChildren(); // removes all children, its a misleading function name since we aren't replacing anything yet
    bottomPlacement = pageNum * 50; // What the bottom of the page will have
    topPlacement = bottomPlacement - 49; // What the top of the page will have
    for (let i = topPlacement; i <= bottomPlacement; i++) {
        if (usersAndPointsArray[i-1] !== undefined) { // Make sure its defined
            visuallyAddPlacement(i, usersAndPointsArray[i-1].name, usersAndPointsArray[i-1].points);
            isOnFinalPage = false;
        } else { // Otherwise if it's not defined that means that this is the final placement and we are on the final page
            isOnFinalPage = true;
        }
        
    }

}

getOverallLeaderboard();

/* Functionality for the overall leaderboard button */
overallLeaderboardButton.addEventListener('click', () => {
    console.log("lb button clicked");
    categoryWeightsContainer.classList.add("hidden");
    overallLeaderboardContainer.classList.remove("hidden");
});

/* Functionality for the category weights button */
categoryWeightsButton.addEventListener('click', () => {
    console.log("category weights button clicked");
    overallLeaderboardContainer.classList.add("hidden");
    categoryWeightsContainer.classList.remove("hidden");
});

/* Functionality for the left and right buttons found in the bottom
 * navigation panel for the overall leaderboard */
cycleLeftButton.addEventListener('click', () => {
    console.log("cycle left button clicked");
    if (currentPage > 1) { // Make sure it's atleast greater than 1
        currentPage--;
        // Scroll back to top of page
        window.scrollTo(0, 0);
    }
    // Place this text before
    pageText.innerHTML = `Page ${currentPage} of ${finalPage}`;
    visuallyDisplayPage(currentPage);
});

cycleRightButton.addEventListener('click', () => {
    console.log("cycle right button clicked");
    if (currentPage < finalPage) {
        currentPage++;
        // Scroll back to top of page
        window.scrollTo(0, 0);
    }
    visuallyDisplayPage(currentPage);
    pageText.innerHTML = `Page ${currentPage} of ${finalPage}`;
});

