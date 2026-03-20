{
    const containers = document.querySelectorAll('.velocity-text');

    containers.forEach(container => {
        // Configuration
        const textContent = "Sean Lacson"; // The text to display
        const baseVelocity = 0.5;          // Base speed of movement
        const scrollFactor = 5;          // How much scrolling affects speed
        const numCopies = 10;            // Number of copies to ensure smooth looping on wide screens
        
        // Check for direction override in HTML (1 for left, -1 for right)
        const directionOverride = parseInt(container.getAttribute('data-direction')) || 1; 

        // 1. Setup HTML Structure dynamically
        // Replaces existing content with the scroller structure
        container.innerHTML = ''; 
        const scroller = document.createElement('div');
        scroller.className = 'scroller';
        container.appendChild(scroller);

        const spans = [];
        for (let i = 0; i < numCopies; i++) {
            const span = document.createElement('span');
            span.textContent = textContent;
            scroller.appendChild(span);
            spans.push(span);
        }

        // 2. Animation Variables
        let baseX = 0;
        let lastScrollY = window.scrollY;
        let currentVelocity = 0;

        // 3. Animation Loop
        function animate() {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            // Smooth out the velocity (Simple damping)
            // This approximates the 'useSpring' effect from the React code
            currentVelocity += (delta - currentVelocity) * 0.1;

            // Calculate movement
            // Base movement + velocity effect
            // We apply directionOverride to baseVelocity so it moves naturally without scroll
            let moveBy = (baseVelocity * directionOverride);
            
            // Add velocity effect based on scroll speed
            // If we are scrolling, we want to boost the movement in the current direction
            if (Math.abs(currentVelocity) > 0.1) {
                moveBy += (currentVelocity * scrollFactor * directionOverride);
            }

            // Apply movement (subtracting moves text left, which is standard marquee)
            baseX -= moveBy;

            // Infinite Loop / Wrapping Logic
            const itemWidth = spans[0].offsetWidth;
            
            if (itemWidth > 0) {
                // Standard modulo wrapping formula
                baseX = ((baseX % itemWidth) - itemWidth) % itemWidth;
            }

            // Apply transform
            scroller.style.transform = `translateX(${baseX}px)`;

            requestAnimationFrame(animate);
        }

        // Start the loop
        requestAnimationFrame(animate);
    });
}