/* This code is the "main" flow of the program. This code includes global variables that are used, 
 * and also the main arrays as well. This is like the "model" or the "data" of the application that will
 * be accessed from the other files */

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










