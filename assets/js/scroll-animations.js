
/* ============================================================
   FOX ROADMAPS — SCROLL ANIMATIONS
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const revealElements = document.querySelectorAll(
        ".scroll-reveal, .scroll-reveal-card"
    );

    if (!revealElements.length) {
        return;
    }


    /* ------------------------------------------------------------
       Respect reduced-motion preferences
       ------------------------------------------------------------ */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }


    /* ------------------------------------------------------------
       Intersection Observer
       ------------------------------------------------------------ */

    const observer = new IntersectionObserver(
        (entries, observerInstance) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                /*
                 * Stop observing after the animation has played.
                 * This prevents the animation from replaying every
                 * time the user scrolls past the element.
                 */
                observerInstance.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -50px 0px"
        }
    );


    /* ------------------------------------------------------------
       Start observing
       ------------------------------------------------------------ */

    revealElements.forEach(element => {
        observer.observe(element);
    });

});
