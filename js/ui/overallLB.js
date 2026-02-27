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
        loopThroughLeaderBoard(lb120, CATEGORY_120_STAR_ID); // 120 
        loopThroughLeaderBoard(lb70, CATEGORY_70_STAR_ID); // 70
        loopThroughLeaderBoard(lb16, CATEGORY_16_STAR_ID); // 16
        loopThroughLeaderBoard(lb1, CATEGORY_1_STAR_ID); // 1
        loopThroughLeaderBoard(lb0, CATEGORY_0_STAR_ID); // 0

        /* Sort the usersAndPointsArray by points before displaying it */
        usersAndPointsArray.sort((a, b) => b.points - a.points);

        /* Based on the size of the array, calculate the final page number
        * and set that variable accordingly */
        finalPage = Math.floor( usersAndPointsArray.length / 50 ); // The final page will be the length divided by 50 rounded down
        // console.log(`final page calculated to be ${finalPage}`);

        /* Display overall leaderboard based on their users and points */
        console.log("users and their points:");
        console.log(usersAndPointsArray);
        // Start by displaying the first page
        visuallyDisplayPage(currentPage);
    }
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
function visuallyAddPlacement(placement, name, points, icon, playerColors, ranks) {
    const placementDiv = document.createElement("div");
    placementDiv.classList.add("leaderboard-place-panel");
    overallLeaderboardPlacementsContainer.appendChild(placementDiv);
    /* Placement Number Element */
    const numberPlacementText = document.createElement("span");
    numberPlacementText.textContent = `#${placement}`
    numberPlacementText.classList.add("player-rank");
    // /* Check if it's rank 1, 2, or 3, if it is add styling */
    if (placement == 1) {
        numberPlacementText.classList.add("rank-one");
    } else if (placement == 2) {
        numberPlacementText.classList.add("rank-two");
    } else if (placement == 3) {
        numberPlacementText.classList.add("rank-three");
    }
    placementDiv.appendChild(numberPlacementText);
    /* Player Icon*/
    if (icon != null && icon !== "") {
        const playerIcon = document.createElement("img");
        playerIcon.classList.add("player-icon");
        playerIcon.src = `${icon}`;
        placementDiv.appendChild(playerIcon);
    } else {
        const playerIcon = document.createElement("img");
        playerIcon.classList.add("player-icon");
        playerIcon.src = "images/user.png";
        playerIcon.style.backgroundColor = playerColors[0];
        placementDiv.appendChild(playerIcon);
    }
    /* Name element */
    const nameElement = document.createElement("span");
    nameElement.textContent = `${name}`
    nameElement.style.color = playerColors[0];
    nameElement.classList.add("player-name");
    placementDiv.appendChild(nameElement);
    shrinkToFit(nameElement);
    /* Ranks for 120, 70, 16, 1, and 0 */
    const categories = ["120", "70", "16", "1", "0"];
    categories.forEach( (category, index, categories) => {
        const rank = categories[index];
        const rankElement = document.createElement("span");
        if (ranks[category] != -1) {
            rankElement.textContent = `${category}: #${ranks[category]}`;
        } else { // Otherwise, that means they don't have a time in this category
            rankElement.textContent = "-"
        }
        rankElement.classList.add("rank-element");
        placementDiv.appendChild(rankElement);
        shrinkToFit(rankElement);
    })

}

/* TODO: function to add styling to a span based if its #1, #2, #3 etc. */
function styleRank(HTMLElement) {
    
}

/* Function to shrink an element's font size so that it fits, this will be used on a lot
 * of the <span> elements in the placement panel */
function shrinkToFit(element) {
    if (element.scrollWidth > element.clientWidth) { /* Check if the text is overflowing the container, if it is we'll just reduce the font size a bit */
        element.style.fontSize = "1rem";
    }
}
    