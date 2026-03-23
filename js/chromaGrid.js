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

        card.addEventListener('mousemove', e => {
            // Use the cached rect; if it's null, the mouse just entered.
            if (!cardRect) cardRect = card.getBoundingClientRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        // Reveal color on hover by bringing the card in front of the overlays
        card.addEventListener('mouseenter', () => {
            // Cache the card's position and dimensions on hover to avoid recalculating on every mouse move
            cardRect = card.getBoundingClientRect();
            // The overlays have z-indexes of 3 and 4, so 5 will bring this card to the front.
            card.style.zIndex = '5';
        });

        card.addEventListener('mouseleave', () => {
            cardRect = null; // Clear the cache
            card.style.zIndex = ''; // Reset to its default stacking context
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
    window.addEventListener('resize', () => {
        gridRect = grid.getBoundingClientRect();
    });

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