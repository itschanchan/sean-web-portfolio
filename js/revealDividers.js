document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded.");
        return;
    }

    const dividers = document.querySelectorAll(".divider-container");

    dividers.forEach(container => {
        const hr = container.querySelector("hr");
        const texts = container.querySelectorAll("p");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top 90%", // Trigger when the top of the divider hits 90% of the viewport height
                toggleActions: "play none none reverse"
            }
        });

        tl.fromTo(hr, 
            { scaleX: 0, transformOrigin: "center center" }, 
            { scaleX: 1, duration: 1.5, ease: "expo.out" }
        )
        .fromTo(texts, 
            { y: 20, autoAlpha: 0 }, 
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power2.out" }, 
            "<0.1" // Start shortly after the line animation begins
        );
    });
});