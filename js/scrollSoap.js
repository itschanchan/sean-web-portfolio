document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('smooth-content');
    
    // If the wrapper doesn't exist, stop.
    if (!scroller) return;

    // Configuration
    const ease = 0.05; // Lower = more slippery
    let currentY = 0;
    let targetY = 0;

    // Set required styles for the fixed container
    Object.assign(scroller.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        willChange: 'transform',
        zIndex: '1' // Ensure it sits above background but respects other z-indexes
    });

    // ResizeObserver ensures body height matches content height
    // This keeps the native scrollbar working correctly even as content loads dynamically
    const resizeObserver = new ResizeObserver(() => {
        document.body.style.height = `${scroller.scrollHeight}px`;
    });
    resizeObserver.observe(scroller);

    // Animation Loop
    function animate() {
        targetY = window.scrollY;
        
        // Linear Interpolation (Lerp) for smooth effect
        currentY += (targetY - currentY) * ease;

        // Expose current scroll position for other scripts (like manual sticky elements)
        window.smoothScrollY = currentY;
        
        // Apply the transform
        scroller.style.transform = `translate3d(0, -${currentY}px, 0)`;
        
        requestAnimationFrame(animate);
    }

    animate();

    // Handle Anchor Links (Fixes navigation jumping due to fixed positioning)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId.length <= 1) return; // Ignore '#' or empty

        const targetElem = document.querySelector(targetId);
        if (targetElem) {
            e.preventDefault();

            // Calculate target position relative to the document
            // rect.top is visual position, currentY is current transform offset
            const rect = targetElem.getBoundingClientRect();
            const absoluteTop = rect.top + currentY;
            const offset = 100; // Header offset

            window.scrollTo({
                top: absoluteTop - offset,
                behavior: 'auto' // Let the smooth scroll loop handle the animation
            });
        }
    });
});