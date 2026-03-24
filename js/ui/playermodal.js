/* This is the code for the functionality of the player modal */

const playerModalBackground = document.querySelector(".modal-background");
const playerModal = document.querySelector(".player-modal");
const modalPlayerName = document.querySelector(".modal-player-name");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalTitleElement = document.querySelector(".modal-title");
const totalPointsElement = document.querySelector(".total-points");
const playerTimesAndPoints = document.querySelector(".player-times-and-points");


function openPlayerModal(placementDiv, placement, ranks) {
    /* Make it visually appear */
    playerModalBackground.classList.remove("hidden");
    playerModal.classList.remove("hidden");

    /* Remove any elements in the modal title before adding any new ones */
    [...modalTitleElement.children].forEach(child => {
            child.remove();
    });

    /* Based on the placement panel that was clicked, clone it's contents into this one
     * to avoid code repetition and just recreating them all the same way: */
    const copiedElement = placementDiv.cloneNode(true);
    modalTitleElement.appendChild(copiedElement);

    /* Find the player's total points and display it. This will be done using the 
     * "placement" number and looking in the usersAndPointsArray, subtract by 1
     * so that it gets the right index */
    const totalPoints = usersAndPointsArray[placement-1].points;
    totalPointsElement.textContent = `Total Points: ${totalPoints.toFixed(2)}`;

    /* Find the player's 120 time based on the ranks, and points that they were rewarded from it */
    // if (ranks["120"] != -1) {
    //     const category120Rank = ranks["120"];
    //     const category120Time = lb120[category120Rank-1].time;
    //     let category120Weight = category_weights["wkpoo02r"]; // 120 star id
    //     let category120Points = (category120Weight * ( 1000 * ( 1 / ((category120Rank-1) + 1) ) ) );
    //     category120Element.textContent = `120 - ${category120Points.toFixed(2)} points (${formatTime(category120Time)})`;
    // } else {
    //     category120Element.textContent = `120 - 0 points`;
    // }


    /* Before adding elements into the player-points-and-times element,
     * remove it's child elements */
    [...playerTimesAndPoints.children].forEach(child => {
            child.remove();
    });


    /* Optimized version */
    /* Ranks for 120, 70, 16, 1, and 0 */
    const categories = ["120", "70", "16", "1", "0"];
    categories.forEach((category) => {
        /* Create the div element that will contain the points and time */
        const categoryElement = document.createElement("div");
        if (ranks[category] != -1) {
            let categoryRank = ranks[category];
            /* This is the "original" time, consoleEquivalentTime will be equal to this
             * if the run was done on console */
            let categoryTime = -1; 
            let consoleEquivalentTime = -1
            let categoryId = "";
            /* Get the category time from either the lb120, lb70, lb16, lb1, lb0 arrays */
            switch (category) {
                case "120":
                    categoryTime = lb120[categoryRank - 1].time;
                    consoleEquivalentTime = lb120[categoryRank - 1].consoleEquivalentTime;
                    categoryId = CATEGORY_120_STAR_ID;
                    break;
                case "70":
                    categoryTime = lb70[categoryRank - 1].time;
                    categoryId = CATEGORY_70_STAR_ID;
                    consoleEquivalentTime = lb70[categoryRank - 1].consoleEquivalentTime;
                    break;
                case "16":
                    categoryTime = lb16[categoryRank - 1].time;
                    categoryId = CATEGORY_16_STAR_ID;
                    consoleEquivalentTime = lb16[categoryRank - 1].consoleEquivalentTime;
                    break;
                case "1":
                    categoryTime = lb1[categoryRank - 1].time;
                    categoryId = CATEGORY_1_STAR_ID;
                    consoleEquivalentTime = lb1[categoryRank - 1].consoleEquivalentTime;
                    break;
                case "0":
                    categoryTime = lb0[categoryRank - 1].time;
                    categoryId = CATEGORY_0_STAR_ID;
                    consoleEquivalentTime = lb0[categoryRank - 1].consoleEquivalentTime;
                    break;
            }

            /* After getting the id and time, calculate the category weight and points
            * that would be awarded */
            let categoryWeight = category_weights[categoryId]; // 120 star id
            let categoryPoints = (categoryWeight * (1000 * (1 / ((categoryRank - 1) + 1))));
            /* Check if the category time is not equal to the console equivalent time, 
             * if it's not, we should clarify that it's a converted time in the string */
            if (categoryTime != consoleEquivalentTime) {
                categoryElement.textContent = `#${categoryRank} in ${category} - ${categoryPoints.toFixed(2)} points - ${formatTime(consoleEquivalentTime)} (emu/vc: ${formatTime(categoryTime)})`;
            } else {
                categoryElement.textContent = `#${categoryRank} in ${category} - ${categoryPoints.toFixed(2)} points - ${formatTime(categoryTime)}`;
            }
            /* This will only be appended if there is a time, otherwise we won't even get to this point
             * and we'll skip adding a blank element */
            playerTimesAndPoints.appendChild(categoryElement);
        }
    });
}

function closePlayerModal() {
    playerModalBackground.classList.add("hidden");
    playerModal.classList.add("hidden");
}

modalExitButton.addEventListener('click', closePlayerModal)
playerModalBackground.addEventListener('click', closePlayerModal) // Clicking the background should also close the modal