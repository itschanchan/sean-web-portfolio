(function() {
    const adSection = document.querySelector('.advertisment');

    if (!adSection) return;

    const elementsToScale = adSection.querySelectorAll('.velocity-text, .ad-image');

    function onScroll() {
        const rect = adSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate how far the section center is from the viewport center
        const sectionCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const dist = Math.abs(sectionCenter - viewportCenter);

        // Maximum distance to consider (e.g., when section is roughly out of view)
        const maxDist = (viewportHeight + rect.height) / 1.5;

        // Calculate scale: 1.0 when centered, scales down to 0 at edges
        // Formula: 1 - (dist / maxDist)
        let scale = 1 - (dist / maxDist);

        // Clamp scale between 0 and 1
        scale = Math.max(0, Math.min(scale, 1));

        elementsToScale.forEach(el => {
            el.style.transform = `scale(${scale})`;
        });
    }

    window.addEventListener('scroll', () => requestAnimationFrame(onScroll));
    // Initial call to set state
    onScroll();
})();