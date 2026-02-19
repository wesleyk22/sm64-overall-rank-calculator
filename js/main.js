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

/* HTML elements that are selected and assigned to variables */
const overallLeaderboardContainer = document.querySelector(".overall-leaderboard-container");
const overallLeaderboardPlacementsContainer = document.querySelector(".overall-leaderboard-placements-container")
const categoryWeightsContainer = document.querySelector(".category-weights-container");
const overallLeaderboardButton = document.querySelector(".lb-button");
const categoryWeightsButton = document.querySelector(".category-weights-button");
const overallLeaderboardNavPanel = document.querySelector(".overall-lb-nav-panel")
const cycleLeftButton = document.querySelector(".page-cycle-left");
const cycleRightButton = document.querySelector(".page-cycle-right");
const pageText = document.querySelector(".page-text");
const searchTextField = document.querySelector(".search-text-field");
const searchButton = document.querySelector(".search-button");

/* Function to that returns the desired amount of 
 * leaderboard placements for a given category ID,
 * game ID, and platform ID. It will return an array
 * of sorted javascript objects that represent runs that
 * will have the name of the runner, time of the run, and 
 * if it was emulator or vc it's converted to the time of
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



/* Using the variables for the 5 categories, sort the overall leaderboard (AKA
 * the usersAndPointsArray) based on the category weights */
function displayOverallLeaderboard() {
    // Make sure the data is retrieved, otherwise there's nothing to display
    if (dataRetrieved == true) {
        /* Clear the usersAndPoints array */
        usersAndPointsArray.length = 0;
        // commenting this out since I think it's repetitive
        // /* (remove all placement panels) */
        // [...overallLeaderboardContainer.children].forEach(child => {
        //     if (child.classList.contains("leaderboard-place-panel")) {
        //         child.remove();
        //     }
        // });
        /* Loop through the 5 leaderboards that we got in the getFiveCategories()
        * function, based on the category_weights object that is customizable
        * by the user, creating a new overall leaderboard  */
        loopThroughLeaderBoard(lb120, category_weights["wkpoo02r"]); // 120 
        loopThroughLeaderBoard(lb70, category_weights["7dgrrxk4"]); // 70
        loopThroughLeaderBoard(lb16, category_weights["n2y55mko"]); // 16
        loopThroughLeaderBoard(lb1, category_weights["7kjpp4k3"]); // 1
        loopThroughLeaderBoard(lb0, category_weights["xk9gg6d0"]); // 0

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
    displayOverallLeaderboard();
}
// Run the above function (TODO: just make it anonymous since we only need to run it once)
getFiveCategories();


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
    overallLeaderboardPlacementsContainer.appendChild(placementDiv);
}

/* Function to display a "page" of the leaderboard. Each page will have 50
 * placements */
function visuallyDisplayPage(pageNum) {
    /* Visually remove leaderboard placements, and also the spinner symbol */
    [...overallLeaderboardPlacementsContainer.children].forEach(child => {
        if (child.classList.contains("leaderboard-place-panel") || child.classList.contains("fa-spinner")) {
            child.remove();
        }
    });
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
    // Update text
    pageText.innerHTML = `Page ${currentPage} of ${finalPage}`

}

/* Function to both visually and programatically update the weights of
 * each category */
function updateCategoryWeight(CategoryID, weightChange) {
    /* Check if the category ID exists in the lookup table */
    if (CategoryID in category_weights) {
        console.log(`category id of ${CategoryID} found in array`);
        /* Programatically update weight with weightChange */
        console.log(`original category weight: ${category_weights[CategoryID]}`);
        category_weights[CategoryID] += weightChange;
        console.log(`new category weight: ${category_weights[CategoryID].value}`);
        /* Visually update weight on the html */
        // Find the slider by category ID
        const categoryWeightSlider = document.querySelector(`[data-category-id="${CategoryID}"]`);
        // Find the slider-text class that should be a child element of the category weight slider
        const sliderText = categoryWeightSlider.querySelector(".slider-text");
        // Calculate percentage
        const percentAsInteger =  (category_weights[CategoryID] * 100);
        // Update the text
        sliderText.textContent = `${percentAsInteger.toFixed(0)}%`;
    }
}

/* Functionality for the overall leaderboard button */
overallLeaderboardButton.addEventListener('click', () => {
    console.log("lb button clicked");
    categoryWeightsContainer.classList.add("hidden");
    overallLeaderboardNavPanel.classList.remove("hidden");
    overallLeaderboardContainer.classList.remove("hidden");
    // Display the overall leaderboard
    displayOverallLeaderboard();
});

/* Functionality for the category weights button */
categoryWeightsButton.addEventListener('click', () => {
    console.log("category weights button clicked");
        overallLeaderboardContainer.classList.add("hidden");
        overallLeaderboardNavPanel.classList.add("hidden");
        categoryWeightsContainer.classList.remove("hidden");    
});

/* Functionality for the left and right buttons found in the bottom
 * navigation panel for the overall leaderboard */
cycleLeftButton.addEventListener('click', () => {
    console.log("cycle left button clicked");
    if (currentPage > 1) { // Make sure it's atleast greater than 1
        currentPage--;
        // Scroll back to top of page
        // window.scrollTo(0, 0);
    }
    // pageText.innerHTML = `Page ${currentPage} of ${finalPage}`;
    visuallyDisplayPage(currentPage);
});

cycleRightButton.addEventListener('click', () => {
    console.log("cycle right button clicked");
    if (currentPage < finalPage) {
        currentPage++;
        // Scroll back to top of page
        // window.scrollTo(0, 0);
    }
    visuallyDisplayPage(currentPage);
    // pageText.innerHTML = `Page ${currentPage} of ${finalPage}`;
});

/* Select all left sliders for category weights and add event listeners to them */
const leftSliders = document.querySelectorAll(".slider-left-btn");

leftSliders.forEach(slider => {
    slider.addEventListener('click', () => {
        console.log("left slider clicked");
        /* Check the category id of the slider that we are clicking */
        // let CategoryID = slider.parentElement.dataset.CategoryID;
        let CategoryID = slider.parentElement.getAttribute('data-category-id');
        console.log(`left slider with category id of ${CategoryID} clicked`);
        updateCategoryWeight(CategoryID, -0.1); // Subtract 10%
    });
});

/* Select all right sliders for category weights and add event listeners to them */
const rightSliders = document.querySelectorAll(".slider-right-btn");

rightSliders.forEach(slider => {
    slider.addEventListener('click', () => {
        console.log("right slider clicked");
        /* Check the category id of the slider that we are clicking */
        // let CategoryID = slider.parentElement.dataset.CategoryID;
        let CategoryID = slider.parentElement.getAttribute('data-category-id');
        console.log(`right slider with category id of ${CategoryID} clicked`);
        updateCategoryWeight(CategoryID, 0.1); // Add 10%
    });
});



// Store the searchPlayer function in a variable to be re used
function searchPlayer(event) {
    /* Make sure we either triggered this event by pressing enter, OR just clicking
     * the search button */
    if ( (event.type === "keydown" && event.key === "Enter") || (event.type === "click") ) {
        const playerNameToSearch = searchTextField.value;
        console.log(`Searching for ${playerNameToSearch}`); // TODO: Add functionality for this
        // Check if the usersAndPointsArray contains the name (ignore case sensitivity)
        const indexOfPlayer = usersAndPointsArray.findIndex(obj => obj.name.toLowerCase() === playerNameToSearch.toLowerCase());
        console.log(indexOfPlayer);
        if (indexOfPlayer != -1) { // If it's not -1, then we found the player name
            // Find the page that this would be on using the index
            let pagePlayerIsOn = Math.ceil( (indexOfPlayer + 1) / 50);
            currentPage = pagePlayerIsOn;
            visuallyDisplayPage(pagePlayerIsOn);
            /* Find visually where the player is on the screen, then smoothly scroll
            * to it (also ignore case sensitivity for this */
            let playerPlacementInHTML = [...document.querySelectorAll(".leaderboard-place-panel")]
                .filter(e => e.textContent.toLowerCase().includes(`${playerNameToSearch.toLowerCase()}`));
            if (playerPlacementInHTML.length > 0) {
                console.log("found the placer placement in html");
                playerPlacementInHTML[0].scrollIntoView({ behavior: "smooth", block: "center"});
                playerPlacementInHTML[0].classList.add("highlight")
                // After 500 milliseconds add the "fade" class to fade out the element
                setTimeout( () => {
                    playerPlacementInHTML[0].classList.add("fade");
                }, 500);
                // Remove classes after it's all over
                setTimeout( () => {
                    playerPlacementInHTML[0].classList.remove("highlight", "fade");
                }, 1500);

            }
        } else { // Player was not found, so notify them that 
            searchTextField.value = "";
            searchTextField.placeholder = `Could not find player "${playerNameToSearch}"`;
            // Make it so the text is not editable while we notify user
            searchTextField.readOnly = true;
            setTimeout( () => {
                searchTextField.placeholder = "Search player name:";
            }, 1000)
            searchTextField.readOnly = false;
        }
    }
};

/* Assign functionionality of SearchPlayer to both the textfield and
 * the button */
searchTextField.addEventListener("keydown", searchPlayer)
searchButton.addEventListener("click", searchPlayer);



