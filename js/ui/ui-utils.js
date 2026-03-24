/* Re-usable functions for UI in the page */

/* TODO: function to add styling to a span based if its #1, #2, #3 etc. */
function styleRank(HTMLElement) {
    
}

/* Function to shrink an element's font size so that it fits, this will be used on a lot
 * of the <span> elements in the placement panel */
function shrinkToFit(element) {
    let fontSize = 1.5
    /* Skip this whole function for short strings that we don't need to do the computationally intense check of 
     * if (element.scrollWidth > element.clientWidth) */
    if (element.textContent.length <= 10 && element.classList.contains("player-name")) {
        // console.log("skipping check");
        return; // End this function
    } 

    /* Check if the text is overflowing the container,
     * if it is we'll just reduce the font size a bit */
    for (let i = 0; i < 3; i++) {
        
        if (element.scrollWidth > element.clientWidth) { 
            fontSize -= .25; // Subtract 0.25 rem
            element.style.fontSize = `${fontSize}rem`;
        } else {
            break; // Don't run this more than we need to
        }
    }
}

/* Function to format a time that is in the form of just a number value
 * into a string "time" in 00h 00m 00s */
function formatTime(totalSeconds) {
    const hours = Math.floor((totalSeconds) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");

    /* TODO: maybe add milliseconds */

    /* The speedrun.com website rounds these to the third decimal place, 
     * so I'll just do the same here */
    if (hours == 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    
}