/* Code for the player search functionality */

/* HTML elements assigned to variables */
const searchTextField = document.querySelector(".search-text-field");
const searchButton = document.querySelector(".search-button");

// Store the searchPlayer function in a variable to be re used
function searchPlayer(event) {
    /* Make sure we either triggered this event by pressing enter, OR just clicking
     * the search button */
    if ( (event.type === "keydown" && event.key === "Enter") || (event.type === "click") ) {
        const playerNameToSearch = searchTextField.value;
        // console.log(`Searching for ${playerNameToSearch}`);
        // Check if the usersAndPointsArray contains the name (ignore case sensitivity)
        const indexOfPlayer = usersAndPointsArray.findIndex(obj => obj.name.toLowerCase() === playerNameToSearch.toLowerCase());
        // console.log(indexOfPlayer);
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
                // console.log("found the placer placement in html");
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