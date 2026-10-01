
/* ==========================================================================
   1. HOMEPAGE & SEPARATE CATEGORY PAGES FILTER GRID ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const roadmapContainer = document.getElementById('roadmap-container');
    const searchInput = document.getElementById('roadmap-search');

    // Only execute grid logic if the container is present on the page layout
    if (roadmapContainer) {

        // Detect if the current HTML template has restricted data attributes
        const specificCategory =
            roadmapContainer.getAttribute('data-category');

        let activeDataScope = [...roadmaps];
        let isInsideSubfolder = false;


        // If viewing a category page, restrict the roadmap scope
        if (specificCategory) {

            const formattedCategory =
                specificCategory.trim().toLowerCase();

            activeDataScope = roadmaps.filter(book =>
                book.category.toLowerCase() === formattedCategory
            );

            isInsideSubfolder = true;
        }


        // Render initially filtered scope items
        renderRoadmaps(
            activeDataScope,
            isInsideSubfolder
        );


        // Setup real-time search filtering
        if (searchInput) {

            searchInput.addEventListener('input', (e) => {

                const searchTerm =
                    e.target.value.toLowerCase().trim();

                const filteredResults =
                    activeDataScope.filter(roadmap => {

                        return roadmap.title
                            .toLowerCase()
                            .includes(searchTerm);

                    });

                renderRoadmaps(
                    filteredResults,
                    isInsideSubfolder
                );

            });

        }

    }

});


/**
 * Generates and injects HTML roadmap cards dynamically into target grids
 *
 * @param {Array} roadmapsList
 * @param {boolean} isSubfolderPage
 */

function renderRoadmaps(
    roadmapsList,
    isSubfolderPage
) {

    const roadmapContainer =
        document.getElementById('roadmap-container');

    if (!roadmapContainer) return;


    roadmapContainer.innerHTML = '';


    if (roadmapsList.length === 0) {

        roadmapContainer.innerHTML = `
            <div
                style="
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #90938e;
                    padding: 40px 0;
                "
            >
                No roadmaps found matching your search parameters.
            </div>
        `;

        return;
    }


    roadmapsList.forEach((roadmap, index) => {

        let cardElement;


        // Dynamic relative route detection
        const basePathPrefix =
            isSubfolderPage
                ? 'roadmap/detail.html'
                : 'pages/roadmap/detail.html';


        // Correct relative image path
        const imgPathPrefix =
            isSubfolderPage
                ? '../../assets/images/'
                : 'assets/images/';


        // Create available or coming-soon card
        if (roadmap.status === 'available') {

            cardElement =
                document.createElement('a');

            cardElement.href =
                `${basePathPrefix}?book=${roadmap.id}`;

            cardElement.className =
                'roadmap-card available-card scroll-reveal-card';

        } else {

            cardElement =
                document.createElement('div');

            cardElement.className =
                'roadmap-card coming-soon-card scroll-reveal-card';

        }


        const isPremium =
            roadmap.price !== 'FREE';

        const priceClass =
            isPremium
                ? 'tag-price premium'
                : 'tag-price';


        let cardHTML = `
            <div class="card-top">

                <span class="tag-category">
                    ${roadmap.category.toUpperCase()}
                </span>

                <span class="${priceClass}">
                    ${roadmap.price}
                </span>

            </div>


            <!-- Real book cover -->

            <div
                class="book-cover-wrapper"
                style="
                    margin-bottom: 20px;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                "
            >

                <img
                    src="${imgPathPrefix}${roadmap.coverImage}"
                    alt="${roadmap.title}"
                    style="
                        max-height: 220px;
                        width: auto;
                        object-fit: contain;
                        filter:
                            drop-shadow(
                                0 10px 15px
                                rgba(0,0,0,0.45)
                            );
                    "
                >

            </div>


            <div
                class="card-title"
                style="
                    font-size: 1rem;
                    text-align: center;
                    width: 100%;
                    margin-bottom: 15px;
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "
            >
                ${roadmap.title}
            </div>


            <div
                class="card-footer"
                style="width: 100%;"
            >

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


        // Coming soon overlay
        if (roadmap.status === 'coming-soon') {

            cardHTML += `
                <div class="coming-soon-overlay">

                    <span class="coming-soon-badge">
                        COMING SOON
                    </span>

                </div>
            `;

        }


        cardElement.innerHTML = cardHTML;

        roadmapContainer.appendChild(cardElement);

    });


    /*
     * The cards are dynamically created above,
     * so we need to initialize their scroll observers
     * after they have been added to the DOM.
     */

    initializeRoadmapScrollAnimations();

}


/* ==========================================================================
   2. ROADMAP CARD SCROLL ANIMATION
   ========================================================================== */

function initializeRoadmapScrollAnimations() {

    const roadmapCards =
        document.querySelectorAll(
            '.scroll-reveal-card:not(.is-visible)'
        );


    if (!roadmapCards.length) {
        return;
    }


    // Respect reduced-motion accessibility preference

    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    if (prefersReducedMotion) {

        roadmapCards.forEach(card => {
            card.classList.add('is-visible');
        });

        return;
    }


    /*
     * Create an observer for the dynamically generated cards.
     */

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        'is-visible'
                    );


                    /*
                     * Stop observing once the card
                     * has completed its animation.
                     */

                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            }
        );


    roadmapCards.forEach(card => {

        observer.observe(card);

    });

}


/* ==========================================================================
   3. CONTACT FORM SUBMISSION SUCCESS BANNER INTERCEPTOR
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const contactForm =
        document.getElementById('fox-contact-form');


    if (contactForm) {

        contactForm.addEventListener(
            'submit',
            function (e) {

                // Prevent native page reload
                e.preventDefault();


                // Capture user's name
                const userName =
                    document.getElementById(
                        'user-name'
                    ).value;


                // Construct form payload
                const formData =
                    new FormData(contactForm);


                // Send form to Netlify
                fetch('/', {

                    method: 'POST',

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        new URLSearchParams(
                            formData
                        ).toString()

                })

                .then(() => {

                    // Hide form
                    contactForm.style.display =
                        'none';


                    // Create success message
                    const successContainer =
                        document.createElement(
                            'div'
                        );

                    successContainer.className =
                        'form-success-banner';


                    successContainer.innerHTML = `

                        <i class="fa-solid fa-circle-check"></i>

                        <h4>
                            Message Sent Successfully!
                        </h4>

                        <p>
                            Thank you for contacting us,
                            ${userName}. Our team has received
                            your message and will review it.
                            We’ll get back to you within
                            24–48 business hours.
                        </p>

                    `;


                    // Add success message
                    contactForm.parentNode.appendChild(
                        successContainer
                    );

                })


                .catch((error) => {

                    console.error(
                        'Submission failed tracking error states:',
                        error
                    );


                    alert(
                        'Oops! There was a problem dispatching your form fields. Please double check parameters and try again.'
                    );

                });

            }
        );

    }

});

