
// assets/js/main.js

/* ==========================================================================
   HOMEPAGE & DISCOVER GRID MANAGEMENT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const roadmapContainer =
        document.getElementById('roadmap-container');

    const searchInput =
        document.getElementById('roadmap-search');


    // Only execute homepage rendering logic
    // if the container layout hook is present

    if (roadmapContainer) {

        renderRoadmaps(roadmaps);


        // Listen for live character inputs
        // inside the search element

        if (searchInput) {

            searchInput.addEventListener('input', (e) => {

                const searchTerm =
                    e.target.value
                        .toLowerCase()
                        .trim();


                // Perform case-insensitive
                // title matching

                const filteredRoadmaps =
                    roadmaps.filter(roadmap => {

                        return roadmap.title
                            .toLowerCase()
                            .includes(searchTerm);

                    });


                renderRoadmaps(filteredRoadmaps);

            });

        }

    }

});


/**
 * ==========================================================================
 * Generates and injects HTML roadmap cards into the landing container grid
 *
 * @param {Array} roadmapsList
 * Array of roadmap objects to display
 * ==========================================================================
 */

function renderRoadmaps(roadmapsList) {

    const roadmapContainer =
        document.getElementById('roadmap-container');


    if (!roadmapContainer) {
        return;
    }


    // Reset grid content initially
    // to avoid duplication artifacts

    roadmapContainer.innerHTML = '';


    // Show feedback when no roadmaps
    // match the search

    if (roadmapsList.length === 0) {

        roadmapContainer.innerHTML = `
            <div
                style="
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #8e8e93;
                    padding: 40px 0;
                 
                "
            >
                No roadmaps found matching your search.
            </div>
        `;

        return;
    }


    // Process each roadmap

    roadmapsList.forEach(roadmap => {

        let cardElement;


        // ================================================================
        // AVAILABLE ROADMAP
        // ================================================================

        if (roadmap.status === 'available') {

            // Available roadmaps are clickable

            cardElement =
                document.createElement('a');

            cardElement.href =
                `pages/roadmap/detail.html?book=${roadmap.id}`;

            cardElement.className =
                'roadmap-card available-card';

        }


        // ================================================================
        // COMING SOON ROADMAP
        // ================================================================

        else {

            // Coming-soon roadmaps are static

            cardElement =
                document.createElement('div');

            cardElement.className =
                'roadmap-card coming-soon-card';

        }


        // ================================================================
        // PRICE CLASS
        // ================================================================

        const isPremium =
            roadmap.price !== 'FREE';


        const priceClass =
            isPremium
                ? 'tag-price premium'
                : 'tag-price';


        // ================================================================
        // ROADMAP CARD HTML
        // ================================================================

        let cardHTML = `

            <div class="card-top">

                <span class="tag-category">
                    ${roadmap.category.toUpperCase()}
                </span>

                <span class="${priceClass}">
                    ${roadmap.price}
                </span>

            </div>


            <div class="book-placeholder">
                ${roadmap.title}
            </div>


            <div class="card-title">
                ${roadmap.title}
            </div>


            <div class="card-footer">

                <span>
                    <i
                        class="fa-solid fa-download"
                        style="margin-right: 5px;"
                    ></i>

                    ${roadmap.downloads}
                </span>


                <span>
                    ${roadmap.pages}
                </span>

            </div>

        `;


        // ================================================================
        // COMING SOON OVERLAY
        // ================================================================

        if (roadmap.status === 'coming-soon') {

            cardHTML += `

                <div class="coming-soon-overlay">

                    <span class="coming-soon-badge">
                        COMING SOON
                    </span>

                </div>

            `;

        }


        // ================================================================
        // INSERT CARD
        // ================================================================

        cardElement.innerHTML =
            cardHTML;


        roadmapContainer.appendChild(
            cardElement
        );

    });

}
