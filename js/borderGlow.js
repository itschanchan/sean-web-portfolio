document.addEventListener('DOMContentLoaded', () => {
  function initBorderGlow() {
    const cards = document.querySelectorAll('.border-glow-effect');

    cards.forEach(card => {
      // Avoid re-attaching listeners
      if (card.dataset.glowInitialized) return;
      card.dataset.glowInitialized = "true";

      function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    const [cx, cy] = getCenter(el);
    const dx = x - cx;
    const dy = y - cy;

    let kx = Infinity;
    let ky = Infinity;

    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);

    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    const [cx, cy] = getCenter(el);
    const dx = x - cx;
    const dy = y - cy;

    if (dx === 0 && dy === 0) return 0;

    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;

    return degrees;
  }

  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);

    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  });
});
    }

  initBorderGlow();

  // Observe for dynamically loaded content (like intro.html)
  const observer = new MutationObserver(() => initBorderGlow());
  observer.observe(document.body, { childList: true, subtree: true });
});
