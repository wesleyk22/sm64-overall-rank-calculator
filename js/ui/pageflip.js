/* Code for the page flipping functionality */

/* HTML elements assigned to variables */
const cycleLeftButton = document.querySelector(".page-cycle-left");
const cycleRightButton = document.querySelector(".page-cycle-right");
const pageText = document.querySelector(".page-text");

/* Function to display a "page" of the leaderboard. Each page will have 50
 * placements */
function visuallyDisplayPage(pageNum) {
    overallLeaderboardPlacementsContainer.scrollTo({top: 0});
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
            let user = usersAndPointsArray[i - 1];
            visuallyAddPlacement(i, user.name, user.points, user.icon, user.colors, user.ranks);
            // console.log(`visually adding player ${usersAndPointsArray[i-1].name} with colors ${usersAndPointsArray[i-1].playerColors}`);
            isOnFinalPage = false;
        } else { // Otherwise if it's not defined that means that this is the final placement and we are on the final page
            isOnFinalPage = true;
        }
        
    }
    // Update text
    pageText.innerHTML = `Page ${currentPage} of ${finalPage}`
    setTimeout
}

/* Functionality for the left and right buttons found in the bottom
 * navigation panel for the overall leaderboard */
cycleLeftButton.addEventListener('click', () => {
    // console.log("cycle left button clicked");
    if (currentPage > 1) { // Make sure it's atleast greater than 1
        currentPage--;
    }
    visuallyDisplayPage(currentPage);
    
});

cycleRightButton.addEventListener('click', () => {
    // console.log("cycle right button clicked");
    if (currentPage < finalPage) {
        currentPage++;
    }
    visuallyDisplayPage(currentPage);
    
});