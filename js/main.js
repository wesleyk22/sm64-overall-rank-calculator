/* The other files other than this will contain the html elements selected, event listeners for them, and functionality
 * for seperate parts of this application and have been named accordingly */

/* Almost all of these .js files including this one have console.log lines in them stating what 
 * certain parts of the code are doing. these can be uncommented as needed for testing purposes */

/* Get the five categories, after getting them, this function will
 * call the getOverallLeaderboard() found in overallLB.js in the ui folder
 * which then will display the overall leaderboard. */

// Wait until dom content is loaded to start the app
window.addEventListener('DOMContentLoaded', () => { 
    getFiveCategories(); 
});

/* Get 120/70/16/1/0 star leaderboard times, that includes N64, emu, and console. After  */
async function getFiveCategories() {
    [lb120, lb70, lb16, lb1, lb0] = await Promise.all([
        fetchLeaderboardPlacements(CATEGORY_120_STAR_ID, SM64_GAME_ID),
        fetchLeaderboardPlacements(CATEGORY_70_STAR_ID, SM64_GAME_ID),
        fetchLeaderboardPlacements(CATEGORY_16_STAR_ID, SM64_GAME_ID),
        fetchLeaderboardPlacements(CATEGORY_1_STAR_ID, SM64_GAME_ID),
        fetchLeaderboardPlacements(CATEGORY_0_STAR_ID, SM64_GAME_ID),
    ])
    dataRetrieved = true;
    /* After getting the five categories, that is when we can display the 
    overall leaderboard: */
    calculateOverallLeaderboard();
}








