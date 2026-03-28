(function() {
    const adSection = document.querySelector('.banner');
    if (!adSection || typeof gsap === 'undefined') return;

    const elementsToScale = adSection.querySelectorAll('.velocity-text, .banner-image');

    // Optimize using ScrollTrigger to handle scale based on viewport entry/exit
    gsap.fromTo(elementsToScale, 
        { scale: 0.5 }, 
        { 
            scale: 1, 
            ease: "none",
            scrollTrigger: {
                trigger: adSection,
                start: "top bottom", // Start scaling when top of banner enters bottom of viewport
                end: "center center", // Reach full scale when banner is centered
                scrub: true,
                onLeave: () => gsap.to(elementsToScale, { scale: 0.5, duration: 0.5 }), // Optional: Scale back down
                onEnterBack: () => gsap.to(elementsToScale, { scale: 1, duration: 0.5 })
            }
        }
    );
})();