(async function() {
    // --- Configuration & Data ---
    const config = {
        radius: 300,
        columns: 2,
        damping: 0.45,
        fadeOut: 0.6,
        ease: 'power3.out'
    };

    // Fetch Skills Data
    let data = [];
    try {
        const response = await fetch('data/skills_data.json');
        if (response.ok) {
            data = await response.json();
        } else {
            console.error('Failed to load skills data');
            return;
        }
    } catch (error) {
        console.error('Error loading skills data:', error);
        return;
    }

    // --- DOM Elements ---
    const container = document.getElementById('chroma-grid-container');
    if (!container) {
        console.error('Chroma Grid container not found.');
        return;
    }

    // --- Create Grid HTML ---
    const grid = document.createElement('div');
    grid.className = 'chroma-grid';
    grid.style.setProperty('--r', `${config.radius}px`);
    grid.style.setProperty('--cols', config.columns);

    data.forEach(item => {
        const card = document.createElement('article');
        card.className = 'chroma-card';
        card.style.setProperty('--card-border', item.borderColor || 'transparent');
        card.style.setProperty('--card-gradient', item.gradient);
        card.style.cursor = item.url ? 'pointer' : 'default';

        const skillsList = item.skills.map(skill => `<li>${skill}</li>`).join('');

        card.innerHTML = `
            <div class="chroma-img-wrapper">
                <img src="${item.image}" alt="${item.title}" loading="lazy" />
            </div>
            <footer class="chroma-info">
                <h3 class="name">${item.title}</h3>
                <ul>${skillsList}</ul>
            </footer>
        `;

        card.addEventListener('click', () => {
            if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
        });

        let cardRect = null; // Cache for the card's bounding rectangle
        let isHovering = false;
        let mouseX = 0, mouseY = 0;
        let rafId = null;

        // Function to batch DOM updates
        const updateCardStyle = () => {
            if (!isHovering) return;
            card.style.setProperty('--mouse-x', `${mouseX}px`);
            card.style.setProperty('--mouse-y', `${mouseY}px`);
            rafId = requestAnimationFrame(updateCardStyle);
        };

        card.addEventListener('mousemove', e => {
            // Use the cached rect; if it's null, the mouse just entered.
            if (!cardRect) cardRect = card.getBoundingClientRect();
            mouseX = e.clientX - cardRect.left;
            mouseY = e.clientY - cardRect.top;
        });

        // Reveal color on hover by bringing the card in front of the overlays
        card.addEventListener('mouseenter', () => {
            cardRect = card.getBoundingClientRect();
            card.style.zIndex = '5';
            isHovering = true;
            rafId = requestAnimationFrame(updateCardStyle);
        });

        card.addEventListener('mouseleave', () => {
            cardRect = null; // Clear the cache
            card.style.zIndex = ''; // Reset to its default stacking context
            isHovering = false;
            if (rafId) cancelAnimationFrame(rafId);
        });
        grid.appendChild(card);
    });

    const overlay = document.createElement('div');
    overlay.className = 'chroma-overlay';
    grid.appendChild(overlay);

    const fade = document.createElement('div');
    fade.className = 'chroma-fade';
    grid.appendChild(fade);

    // Insert grid before other content (like the static tools section)
    if (container.firstChild) {
        container.insertBefore(grid, container.firstChild);
    } else {
        container.appendChild(grid);
    }

    // --- GSAP Animation Logic ---
    // Cache the grid's bounding rectangle and update it on resize to avoid reflows on mouse move.
    let gridRect = grid.getBoundingClientRect();
    
    const updateGridRect = () => {
        gridRect = grid.getBoundingClientRect();
    };

    window.addEventListener('resize', updateGridRect);
    window.addEventListener('scroll', updateGridRect, { passive: true }); // Update rects on scroll to keep mouse calculation accurate

    const setX = gsap.quickSetter(grid, '--x', 'px');
    const setY = gsap.quickSetter(grid, '--y', 'px');
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setX(pos.x);
    setY(pos.y);

    function moveTo(x, y) {
        gsap.to(pos, {
            x, y,
            duration: config.damping,
            ease: config.ease,
            onUpdate: () => { setX(pos.x); setY(pos.y); },
            overwrite: true
        });
    }

    grid.addEventListener('pointermove', e => {
        // Use the cached rectangle for performance
        moveTo(e.clientX - gridRect.left, e.clientY - gridRect.top);
        gsap.to(fade, { opacity: 0, duration: 0.25, overwrite: true });
    });

    grid.addEventListener('pointerleave', () => {
        gsap.to(fade, { opacity: 1, duration: config.fadeOut, overwrite: true });
    });
})();