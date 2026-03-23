document.addEventListener('DOMContentLoaded', () => {
    const bannerSection = document.querySelector('.banner');
    const track = document.querySelector('.image-track');

    if (!bannerSection || !track) return;

    // Dynamically set height to ensure 1:1 scroll mapping
    function setDimensions() {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Total horizontal distance needed to scroll
        const scrollDistance = trackWidth - viewportWidth;

        // Set container height: Scroll Distance + 1 Viewport Height (for the sticky pause)
        // This ensures the vertical scroll finishes exactly when the horizontal scroll ends
        const totalHeight = scrollDistance + viewportHeight;
        bannerSection.style.height = `${totalHeight}px`;
    }

    // Set initial dimensions and update on resize
    setDimensions();
    window.addEventListener('resize', setDimensions);

    function animate() {
        const rect = bannerSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // The sticky container scrolls for the duration of (bannerHeight - viewportHeight)
        const scrollableHeight = rect.height - viewportHeight;

        // Calculate progress: 0 when top aligns, 1 when bottom aligns
        let percentage = -rect.top / scrollableHeight;
        percentage = Math.max(0, Math.min(percentage, 1));

        // Translate track based on progress
        const maxTranslate = track.scrollWidth - window.innerWidth;
        const translateX = percentage * maxTranslate;

        track.style.transform = `translateX(-${translateX}px)`;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});