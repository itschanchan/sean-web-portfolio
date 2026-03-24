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

    // 1. Dynamic Click Handling (Event Delegation)
    // This ensures smooth scrolling works even for content loaded via loaders.js
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#' || !targetId) return;
        
        lenis.scrollTo(targetId, {
            offset: -100, // Offset for header height
            duration: 1.5
        });
    });

    // 2. Scroll Spy Logic (Highlight Active Link)
    const updateActiveLinks = () => {
        // Select all nav links dynamically on every scroll check
        const links = document.querySelectorAll('.header-nav a[href^="#"], .activity-bar a[href^="#"]');
        
        // Find the current active section
        let activeId = '';
        const triggerPoint = window.innerHeight * 0.4; // 40% down the screen

        // Get unique targets
        const targets = new Set([...links].map(link => link.getAttribute('href')));
        
        targets.forEach(id => {
            const element = document.querySelector(id);
            if (element) {
                const rect = element.getBoundingClientRect();
                // If section top is above trigger point and bottom is below it
                if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
                    activeId = id;
                }
            }
        });

        // Apply active class
        links.forEach(link => {
            if (link.getAttribute('href') === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Run Scroll Spy on scroll event
    lenis.on('scroll', updateActiveLinks);
});