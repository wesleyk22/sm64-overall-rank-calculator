/* Code for the overall leaderboard functionality */

/* HTML elements assigned to variables */
const overallLeaderboardButton = document.querySelector(".lb-button");
const overallLeaderboardNavPanel = document.querySelector(".overall-lb-nav-panel")
const overallLeaderboardContainer = document.querySelector(".overall-leaderboard-container");
const overallLeaderboardPlacementsContainer = document.querySelector(".overall-leaderboard-placements-container")

/* Using the variables for the 5 categories, sort the overall leaderboard (AKA
 * the usersAndPointsArray) based on the category weights */
function calculateOverallLeaderboard() {
    // Make sure the data is retrieved, otherwise there's nothing to display
    if (dataRetrieved == true) {
        /* Clear the usersAndPoints array */
        usersAndPointsArray.length = 0;

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
        // console.log(`final page calculated to be ${finalPage}`);

        /* Display overall leaderboard based on their users and points */
        // console.log("users and their points:");
        // console.log(usersAndPointsArray);
        // Start by displaying the first page
        visuallyDisplayPage(currentPage);
    }
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

/* Functionality for the overall leaderboard button */
overallLeaderboardButton.addEventListener('click', () => {
    // console.log("lb button clicked");
    categoryWeightsContainer.classList.add("hidden");
    overallLeaderboardNavPanel.classList.remove("hidden");
    overallLeaderboardContainer.classList.remove("hidden");
    // Display the overall leaderboard
    calculateOverallLeaderboard();
});

/* Function to visually display an overall leaderboard placement in the DOM */
function visuallyAddPlacement(placement, name, points) {
    const placementDiv = document.createElement("div");
    placementDiv.classList.add("leaderboard-place-panel");
    overallLeaderboardPlacementsContainer.appendChild(placementDiv);
    // placementDiv.textContent = `#${placement} - ${name} (${points.toFixed(2)})`;
    const textElement = document.createElement("span");
    textElement.textContent = `#${placement} - ${name} (${points.toFixed(2)})`
    placementDiv.appendChild(textElement);
    /* TODO: implement player icons */
    // const playerIcon = document.createElement("img");
    // playerIcon.classList.add("player-icon");
    // playerIcon.src = "https://www.speedrun.com/static/user/jn32931x/icon?v=a137a7b";
    // placementDiv.appendChild(playerIcon);
}

