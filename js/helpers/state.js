/* This is the "State" file which will contain everything about this project that is 
 * the "data" of it, whether it's local storage or arrays of javascript objects. It will
 * also include global variables / arrays / and constant variables aswell */

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
 * place on the leaderboards. This is essentially the "overall leaderboard" */
const usersAndPointsArray = [];

/* Number that will determine what number of placements to get from each
 * leaderboard */
const numLBPlacements = 1000;

/* Number that represents the current page that is being displayed */
let currentPage = 1;
let finalPage = 0; // This will be calculated and set to a number after the usersAndPointsArray is completed 