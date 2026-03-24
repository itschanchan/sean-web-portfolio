document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for smooth scrolling
    // This library preserves native scroll behavior (fixing sticky elements)
    // while simply interpolating the scroll position to prevent lag.
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis not loaded. Smooth scrolling disabled.");
        return;
    }

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Integration with GSAP ScrollTrigger (Best Performance)
    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);
    } else {
        // Fallback: Use native RAF only if GSAP is not present
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Handle Anchor Links (Smooth scroll to section)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            lenis.scrollTo(targetId, {
                offset: -100, // Offset for header height
                duration: 1.5
            });
        });
    });
});