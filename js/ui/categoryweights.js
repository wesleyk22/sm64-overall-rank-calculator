/* Code for the category weights page functionality */

/* HTML elements assigned to variables */
const categoryWeightsButton = document.querySelector(".category-weights-button");
const categoryWeightsContainer = document.querySelector(".category-weights-container");

/* Functionality for the category weights button */
categoryWeightsButton.addEventListener('click', () => {
    //console.log("category weights button clicked");
    overallLeaderboardContainer.classList.add("hidden");
    overallLeaderboardNavPanel.classList.add("hidden");
    categoryWeightsContainer.classList.remove("hidden");    
});

/* Select all left sliders for category weights and add event listeners to them */
const leftSliders = document.querySelectorAll(".slider-left-btn");

leftSliders.forEach(slider => {
    slider.addEventListener('click', () => {
        //console.log("left slider clicked");
        /* Check the category id of the slider that we are clicking */
        let CategoryID = slider.parentElement.getAttribute('data-category-id');
        // console.log(`left slider with category id of ${CategoryID} clicked`);
        updateCategoryWeight(CategoryID, -0.1); // Subtract 10%
    });
});

/* Select all right sliders for category weights and add event listeners to them */
const rightSliders = document.querySelectorAll(".slider-right-btn");

rightSliders.forEach(slider => {
    slider.addEventListener('click', () => {
        // console.log("right slider clicked");
        /* Check the category id of the slider that we are clicking */
        // let CategoryID = slider.parentElement.dataset.CategoryID;
        let CategoryID = slider.parentElement.getAttribute('data-category-id');
        // console.log(`right slider with category id of ${CategoryID} clicked`);
        updateCategoryWeight(CategoryID, 0.1); // Add 10%
    });
});

/* Function to both visually and programatically update the weights of
 * each category */
function updateCategoryWeight(CategoryID, weightChange) {
    /* Check if the category ID exists in the lookup table */
    if (CategoryID in category_weights) {
        // console.log(`category id of ${CategoryID} found in array`);
        /* Programatically update weight with weightChange */
        // console.log(`original category weight: ${category_weights[CategoryID]}`);
        category_weights[CategoryID] += weightChange;
        // console.log(`new category weight: ${category_weights[CategoryID].value}`);
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