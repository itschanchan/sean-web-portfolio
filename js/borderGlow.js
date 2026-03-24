document.addEventListener('DOMContentLoaded', () => {
  function initBorderGlow() {
    const cards = document.querySelectorAll('.border-glow-effect');

    cards.forEach(card => {
      // Avoid re-attaching listeners
      if (card.dataset.glowInitialized) return;
      card.dataset.glowInitialized = "true";

      let bounds = null;

      // Efficiently update bounds only when necessary
      const refreshBounds = () => {
        bounds = card.getBoundingClientRect();
      };

      const updateGlow = (e) => {
        if (!bounds) refreshBounds();

        // Mouse position relative to the card (using cached bounds)
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const cx = bounds.width / 2;
        const cy = bounds.height / 2;
        const dx = x - cx;
        const dy = y - cy;

        // --- Angle Math ---
        let angle = 0;
        if (dx !== 0 || dy !== 0) {
          const radians = Math.atan2(dy, dx);
          angle = radians * (180 / Math.PI) + 90;
          if (angle < 0) angle += 360;
        }

        // --- Proximity Math ---
        let kx = Infinity, ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        
        const proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

        card.style.setProperty('--edge-proximity', (proximity * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      };

      // Cache bounds on hover start and update on scroll
      card.addEventListener('mouseenter', () => {
        refreshBounds();
        window.addEventListener('scroll', refreshBounds, { passive: true });
        window.addEventListener('resize', refreshBounds, { passive: true });
      });

      card.addEventListener('mouseleave', () => {
        window.removeEventListener('scroll', refreshBounds);
        window.removeEventListener('resize', refreshBounds);
      });

      card.addEventListener('pointermove', updateGlow);
    });
  }

  initBorderGlow();

  // Observe for dynamically loaded content (like intro.html)
  const observer = new MutationObserver(() => initBorderGlow());
  observer.observe(document.body, { childList: true, subtree: true });
});
