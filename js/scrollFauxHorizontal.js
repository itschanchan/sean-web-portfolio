document.addEventListener('DOMContentLoaded', () => {
    const bannerSection = document.querySelector('.banner');
    const track = document.querySelector('.image-track');

    if (!bannerSection || !track || typeof gsap === 'undefined') return;

    // Use GSAP ScrollTrigger for optimized horizontal scroll
    // This eliminates the manual requestAnimationFrame loop and layout thrashing
    gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: bannerSection,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            scrub: true,
            pin: true, // Let GSAP handle the sticky behavior efficiently
            invalidateOnRefresh: true, // Recalculate on window resize
        }
    });
});